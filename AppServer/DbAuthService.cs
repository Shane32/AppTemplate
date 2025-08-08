using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace AppServer;

/// <summary>
/// Provides user database synchronization services for authentication events.
/// Looks up the user in the database by its Azure Object ID or Google Subject and adds the database's user ID to the claims for easy access.
/// If the user does not exist in the database, it is created.
/// Also updates the user's name and email if they have changed.
/// </summary>
public sealed class DbAuthService
{
    private readonly ILogger<DbAuthService> _logger;

    // Define LoggerMessage delegates for better performance
    private static readonly Action<ILogger, string, Exception?> _logTokenValidationFailed =
        LoggerMessage.Define<string>(
            LogLevel.Error,
            new EventId(1, nameof(OnTokenValidatedAsync)),
            "Token validation failed for JWT subject: {JwtSubject}");

    /// <summary>
    /// Initializes a new instance of the <see cref="DbAuthService"/> class.
    /// </summary>
    public DbAuthService(ILogger<DbAuthService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Handles token validation events from any authentication scheme
    /// </summary>
    public async Task OnTokenValidatedAsync(TokenValidatedContext context, CancellationToken cancellationToken)
    {
        if (context.Principal?.Identity is not ClaimsIdentity identity) {
            _logTokenValidationFailed(_logger, "unknown", new InvalidOperationException("No valid claims identity found"));
            context.Fail("No valid claims identity found");
            return;
        }

        // Clear any existing claims and roles as a security precaution
        ClearApplicableClaimsAndRoles(identity);

        // get the Azure Object ID or Subject
        var jwtSubject = identity.FindFirst(Microsoft.Identity.Web.ClaimConstants.NameIdentifierId)?.Value;
        if (jwtSubject == null) {
            _logTokenValidationFailed(_logger, "unknown", new InvalidOperationException("No JWT subject found in claims"));
            context.Fail("No JWT subject found in claims");
            return;
        }

        try {
            // parse the name and email from the claims
            var name = identity.FindFirst("name")?.Value ?? "";
            var firstName = identity.FindFirst(ClaimTypes.GivenName)?.Value ?? name.Split(' ').FirstOrDefault() ?? "";
            var lastName = identity.FindFirst(ClaimTypes.Surname)?.Value ?? name.Split(' ').Skip(1).FirstOrDefault() ?? "";
            var email = identity.FindFirst(ClaimTypes.Email)?.Value ?? "";

            // Get user info and perform all database operations
            var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
            var user = await db.Users.FirstOrDefaultAsync(u => u.JwtSubject == jwtSubject, cancellationToken);
            if (user == null) {
                user = new User() {
                    JwtSubject = jwtSubject,
                    Name = name,
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                };
                db.Users.Add(user);
                await db.SaveChangesAsync(cancellationToken);
            } else {
                if (!string.IsNullOrEmpty(name))
                    user.Name = name;
                if (!string.IsNullOrEmpty(firstName))
                    user.FirstName = firstName;
                if (!string.IsNullOrEmpty(lastName))
                    user.LastName = lastName;
                if (!string.IsNullOrEmpty(email))
                    user.Email = email;
                await db.SaveChangesAsync(cancellationToken);
            }

            // add the DbUserId claim
            identity.AddClaim(new Claim("DbUserId", user.Id.ToString(CultureInfo.InvariantCulture)));

            // identify all the roles that match and add them to the claim
            foreach (var role in Enum.GetValues<Role>()) {
                if (role != 0 && user.Roles.HasFlag(role)) {
                    identity.AddClaim(new Claim(ClaimTypes.Role, role.ToString()));
                }
            }
        } catch (Exception ex) {
            _logTokenValidationFailed(_logger, jwtSubject ?? "unknown", ex);
            context.Fail(ex);
        }
    }

    /// <summary>
    /// Clears applicable claims and roles from the identity as a security precaution.
    /// </summary>
    /// <param name="identity">The claims identity to clear claims and roles from.</param>
    private static void ClearApplicableClaimsAndRoles(ClaimsIdentity identity)
    {
        // Identify the claims to remove
        var claimsToRemove = identity.FindAll(x => x.Type == "DbUserId" || x.Type == ClaimTypes.Role).ToList();

        // Remove all identified claims
        foreach (var claim in claimsToRemove) {
            identity.RemoveClaim(claim);
        }
    }
}
