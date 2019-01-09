import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { AuthClass as Auth } from '@aws-amplify/auth';

@Injectable({
    providedIn: 'root'
})
// HAHAHAHAHAHAHA this must make frontend devs want to throw up
export class CognitoAuthFactory {
    public create(): Auth {
        return new Auth({
            userPoolId: environment.auth.userPoolId,
            userPoolWebClientId: environment.auth.userPoolWebClientId,
        });
    }
}
