using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using Azure.Core;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AppServer;

[Route("api/oauth")]
public sealed partial class OAuthController : ControllerBase
{
    private const int MAX_REQUEST_BYTES = 32 * 1024;
    private const string CLIENT_ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
    private static readonly string[] _assertionScopes = ["api://AzureADTokenExchange/.default"];
    private static readonly HashSet<string> _authorizationCodeFields = ["grant_type", "client_id", "code", "code_verifier", "redirect_uri", "scope"];
    private static readonly HashSet<string> _refreshTokenFields = ["grant_type", "client_id", "refresh_token", "scope"];

    private readonly JwtBearerOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly TokenCredential _credential;

    public OAuthController(IOptionsMonitor<JwtBearerOptions> options, IHttpClientFactory httpClientFactory, TokenCredential credential)
    {
        _options = options.Get(JwtBearerDefaults.AuthenticationScheme);
        _httpClientFactory = httpClientFactory;
        _credential = credential;
    }

    [HttpPost("token")]
    [RequestSizeLimit(MAX_REQUEST_BYTES)]
    [RequestFormLimits(ValueCountLimit = 6, KeyLengthLimit = 64, ValueLengthLimit = 16384)]
    public async Task<IActionResult> ExchangeTokenAsync(CancellationToken cancellationToken)
    {
        NoStore();
        if (!MediaTypeHeaderValue.TryParse(Request.ContentType, out var contentType) ||
            !string.Equals(contentType.MediaType, "application/x-www-form-urlencoded", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status415UnsupportedMediaType);

        if (Request.ContentLength > MAX_REQUEST_BYTES)
            return StatusCode(StatusCodes.Status413PayloadTooLarge);

        IFormCollection parameters;
        try {
            parameters = await Request.ReadFormAsync(cancellationToken);
        } catch (InvalidDataException) {
            return BadRequest();
        }
        if (parameters.Count > 6 || parameters.Files.Count > 0 ||
            !TryBuildTokenParameters(parameters, _options.TokenValidationParameters.ValidAudience!, Request, out var tokenParameters))
            return BadRequest();

        try {
            var configuration = await _options.ConfigurationManager!.GetConfigurationAsync(cancellationToken);
            if (!Uri.TryCreate(configuration.TokenEndpoint, UriKind.Absolute, out var tokenEndpoint) ||
                tokenEndpoint.Scheme != Uri.UriSchemeHttps)
                return StatusCode(StatusCodes.Status502BadGateway);

            var assertion = await _credential.GetTokenAsync(new TokenRequestContext(_assertionScopes), cancellationToken);
            tokenParameters.Add(new("client_assertion_type", CLIENT_ASSERTION_TYPE));
            tokenParameters.Add(new("client_assertion", assertion.Token));

            using var request = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint) {
                Content = new FormUrlEncodedContent(tokenParameters),
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            using var response = await _httpClientFactory.CreateClient("MicrosoftOAuth")
                .SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            await using var responseBody = await response.Content.ReadAsStreamAsync(cancellationToken);
            Response.StatusCode = (int)response.StatusCode;
            if (response.Content.Headers.ContentType is { } responseContentType)
                Response.ContentType = responseContentType.ToString();
            await responseBody.CopyToAsync(Response.Body, cancellationToken);
            return new EmptyResult();
        } catch (Exception ex) when (!Response.HasStarted &&
            (ex is AuthenticationFailedException or CredentialUnavailableException or HttpRequestException or InvalidOperationException ||
             (ex is TaskCanceledException && !cancellationToken.IsCancellationRequested))) {
            return StatusCode(StatusCodes.Status502BadGateway);
        }
    }

    private void NoStore()
    {
        Response.Headers.CacheControl = "no-store";
        Response.Headers.Pragma = "no-cache";
    }

    private static bool TryBuildTokenParameters(
        IFormCollection parameters,
        string configuredClientId,
        HttpRequest request,
        out List<KeyValuePair<string, string>> tokenParameters)
    {
        tokenParameters = [];
        if (!TryGetSingle(parameters, "grant_type", out var grantType))
            return false;

        var allowedFields = grantType switch {
            "authorization_code" => _authorizationCodeFields,
            "refresh_token" => _refreshTokenFields,
            _ => null,
        };
        if (allowedFields is null || parameters.Keys.Any(key => !allowedFields.Contains(key)) ||
            parameters.Any(entry => entry.Value.Count != 1) ||
            !TryGetSingle(parameters, "client_id", out var clientId) ||
            !string.Equals(clientId, configuredClientId, StringComparison.OrdinalIgnoreCase))
            return false;

        tokenParameters.Add(new("grant_type", grantType));
        tokenParameters.Add(new("client_id", configuredClientId));

        if (grantType == "authorization_code") {
            if (!TryGetSingle(parameters, "code", out var code) || code.Length is < 1 or > 8192 ||
                !TryGetSingle(parameters, "code_verifier", out var verifier) ||
                !CodeVerifierRegex().IsMatch(verifier))
                return false;

            tokenParameters.Add(new("code", code));
            tokenParameters.Add(new("code_verifier", verifier));
            if (parameters.ContainsKey("redirect_uri")) {
                if (!TryGetSingle(parameters, "redirect_uri", out var requestedRedirectUri) ||
                    !Uri.TryCreate(requestedRedirectUri, UriKind.Absolute, out var parsedRedirectUri) ||
                    !string.Equals(parsedRedirectUri.Scheme, request.Scheme, StringComparison.OrdinalIgnoreCase) ||
                    !string.Equals(parsedRedirectUri.Host, request.Host.Host, StringComparison.OrdinalIgnoreCase) ||
                    (request.Host.Port is int port ? parsedRedirectUri.Port != port : !parsedRedirectUri.IsDefaultPort))
                    return false;
                tokenParameters.Add(new("redirect_uri", requestedRedirectUri));
            }
        } else {
            if (!TryGetSingle(parameters, "refresh_token", out var refreshToken) || refreshToken.Length is < 1 or > 16384)
                return false;
            tokenParameters.Add(new("refresh_token", refreshToken));
        }

        if (parameters.TryGetValue("scope", out var scopes))
            tokenParameters.Add(new("scope", scopes.ToString()));
        return true;
    }

    private static bool TryGetSingle(IFormCollection parameters, string name, out string value)
    {
        value = "";
        if (!parameters.TryGetValue(name, out var values) || values.Count != 1 || string.IsNullOrEmpty(values[0]))
            return false;
        value = values[0]!;
        return true;
    }

    [GeneratedRegex(@"\A[A-Za-z0-9._~-]{43,128}\z", RegexOptions.CultureInvariant)]
    private static partial Regex CodeVerifierRegex();
}
