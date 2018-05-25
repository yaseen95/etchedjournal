/**
 * Maps API response when requesting a token
 */
export interface TokenResponse {

  /** access token used as a bearer token to authenticate with the backend */
  accessToken: string;

  /** refresh token used to refresh access token */
  refreshToken: string;

  /** number of seconds access token will expire in */
  expiresIn: number;

  /** number of seconds refresh token will expire in */
  refreshExpiresIn: number;
}
