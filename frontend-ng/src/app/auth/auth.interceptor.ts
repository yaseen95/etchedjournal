import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AUTH_REQUIRED_URLS } from '../services/etched-api-utils';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {
    }

    // visible for testing
    static requiresAuth(url: string): boolean {
        // TODO: Should we use regexes instead?
        return checkAnyStringContains(AUTH_REQUIRED_URLS, url);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // TODO: Should we invert the check?
        // Should we refresh tokens for all paths except known no-auth paths?
        // Or should we refresh tokens for known auth-required paths?
        if (!AuthInterceptor.requiresAuth(req.url)) {
            return next.handle(req);
        }

        // https://stackoverflow.com/a/45979654
        // observables and promises mixing together suck
        return from(this.authService.refreshIfExpired())
            .pipe(
                switchMap(session => {
                    const token = session.getAccessToken().getJwtToken();
                    const req2 = req.clone({setHeaders: {Authorization: `Bearer ${token}`}});
                    return next.handle(req2);
                })
            );
    }
}

/**
 * Check that any of the strings in `strings` contains string `s`
 */
export function checkAnyStringContains(strings: string[], s: string): boolean {
    for (let i = 0; i < strings.length; i++) {
        const x = strings[i];
        if (s.indexOf(x) >= 0) {
            return true;
        }
    }
    return false;
}
