
import * as jwt_decode from 'jwt-decode';

export class TokenDecoder {
    public static decodeToken<T extends Token>(token: string): T {
        return jwt_decode<T>(token);
    }
}

export interface AccessToken extends Token {
}

export interface RefreshToken extends Token {
}

export interface IdToken extends Token {
    preferred_username: string;
}

export interface Token {
    /** Audience, who or what the token is intended for */
    aud: string;

    /** expiry of token as SECONDS since UNIX epoch */
    exp: number;

    /** Issuer of token */
    iss: string;

    /** Subject of token (user who the token has been created for) */
    sub: string;

    /** Type of token e.g. "Bearer" for access, "Refresh" for refresh token */
    typ: string;
}
