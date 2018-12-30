import {
    HttpClient,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import {
    AUTH_REQUIRED_URLS,
    LOCAL_ACCESS_TOKEN,
    LOCAL_REFRESH_TOKEN,
    REFRESH_TOKEN_URL
} from '../services/etched-api.service';
import { AccessToken, TokenDecoder } from '../utils/token-decoder';
import { map, switchMap } from 'rxjs/operators';
import { TokenResponse } from '../services/dtos/token-response';

export const REFRESH_WINDOW: number = 60 * 1_000;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private http: HttpClient) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!AuthInterceptor.requiresAuth(req)) {
            return next.handle(req);
        }

        return this.getLatestAccessTokenStr()
            .pipe(switchMap(accessToken => {
                const req2 = req.clone({setHeaders: {Authorization: `Bearer ${accessToken}`}});
                return next.handle(req2);
            }));
    }

    // visible for testing
    static requiresAuth(req: HttpRequest<any>): boolean {
        return checkAnyStringContains(req.url, AUTH_REQUIRED_URLS);
    }

    /**
     * Refreshes tokens if they're expired or near expiring
     */
    private refreshIfExpired(): Observable<boolean> {
        const accessToken = this.getLocalAccessToken();
        if (accessToken === null) {
            console.error(`Access token is required`);
            throw new Error(`Access token is required`);
        }

        const accessExpiry = accessToken.exp * 1000;
        if ((new Date().getTime() + REFRESH_WINDOW) < accessExpiry) {
            // Token hasn't expired and isn't close to expiring
            return of(true);
        }

        console.info('Refreshing token');
        const refreshBody = {'refreshToken': this.getRefreshTokenStr()};
        return this.http.post(REFRESH_TOKEN_URL, refreshBody)
            .pipe(map((token: TokenResponse) => {
                localStorage.setItem(LOCAL_ACCESS_TOKEN, token.accessToken);
                localStorage.setItem(LOCAL_REFRESH_TOKEN, token.refreshToken);
                return true;
            }));
    }

    private getLatestAccessTokenStr(): Observable<string> {
        return this.refreshIfExpired()
            .pipe(map(() => {
                return this.getAccessTokenStr();
            }));
    }

    private getLocalAccessToken(): AccessToken | null {
        const tokenStr = this.getAccessTokenStr();
        if (tokenStr === null) {
            return null;
        }
        return TokenDecoder.decodeToken<AccessToken>(tokenStr);
    }

    private getAccessTokenStr(): string | null {
        return localStorage.getItem(LOCAL_ACCESS_TOKEN);
    }

    private getRefreshTokenStr(): string | null {
        return localStorage.getItem(LOCAL_REFRESH_TOKEN);
    }
}

/**
 * Check that any of the strings in `strings` contains string `s`
 * @param s
 * @param strings
 */
export function checkAnyStringContains(s: string, strings: string[]): boolean {
    for (let i = 0; i < strings.length; i++) {
        const x = strings[i];
        if (s.indexOf(x) >= 0) {
            return true;
        }
    }
    return false;
}
