import { AuthManager, AuthManagerConfiguration, TokenResponse } from "@shane32/msoauth";

/**
 * Implementation of AuthManager which uses id_token as access_token
 * @template TPolicyNames - Enum type for policy keys
 */
class IdAuthManager<TPolicyNames extends string = string> extends AuthManager<TPolicyNames> {
  /**
   * Creates a new instance of GoogleAuthManager
   * @param {GoogleAuthManagerConfiguration} config - Configuration object for the IdAuthManager
   */
  constructor(config: AuthManagerConfiguration<TPolicyNames>) {
    // Add openid scopes to the configuration
    const idConfig = {
      ...config,
      scopes: ((config.scopes || "") + " openid profile email").trim(),
    };

    // Call the parent constructor with the updated config
    super(idConfig);
  }

  /**
   * Override parseTokenResponse to set access_token to equal id_token
   * This is useful for Google OAuth where the id_token contains user information
   * that may be needed for authentication purposes
   * @param {TokenResponse} response - The raw token response from the OAuth provider
   * @returns {TokenResponse} The modified token response
   * @protected
   */
  protected parseTokenResponse(response: TokenResponse): TokenResponse {
    // Create a copy of the response to avoid modifying the original
    const parsedResponse = { ...response };

    // If id_token exists, set access_token to equal id_token
    if (parsedResponse.id_token) {
      parsedResponse.access_token = parsedResponse.id_token;
    }

    return parsedResponse;
  }
}

export default IdAuthManager;
