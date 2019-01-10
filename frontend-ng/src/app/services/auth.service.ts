import { Injectable } from '@angular/core';
import { AuthClass as Auth } from '@aws-amplify/auth';
import { environment } from '../../environments/environment';
import { RandomUtils } from '../utils/text-utils';
import {
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserSession,
    ISignUpResult
} from 'amazon-cognito-identity-js';
import { EtchedUser } from '../models/etched-user';
import { IdToken, Token, TokenDecoder } from '../utils/token-decoder';
import { CognitoAuthFactory } from './cognito-auth-factory';
import { ClockService } from './clock.service';

// The cognito js library stores data in local storage. The keys for the items in local storage
// are prefixed with the string below.
export const LOCAL_COGNITO_PREFIX = 'CognitoIdentityServiceProvider';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private auth: Auth;
    private user: EtchedUser;

    constructor(private clock: ClockService,
                cognitoAuthFactory: CognitoAuthFactory) {
        this.auth = cognitoAuthFactory.create();
        this.user = AuthService.extractUserDetailsFromStorage(clock);
        if (this.user != null) {
            // noinspection JSIgnoredPromiseFromCall
            this.refreshIfExpired();
        }
    }

    async register(preferredUsername: string, password: string): Promise<void> {
        // Username handling is odd with Cognito
        // Usernames in cognito cannot be changed and they must be unique
        // However, we want to allow the option for a user to change their username in the future.
        // So we register users with a random username and we've configured Cognito to allow logins
        // with a username alias (preferred_username).
        const username = RandomUtils.randomStr(16);
        console.info(`Signing up ${preferredUsername} with generated username ${username}`);

        // sign up
        const signUpResult: ISignUpResult = await this.auth.signUp({
            username: username,
            password: password,
        });

        // sign in to get first set of credentials
        let signInResult: CognitoUser = await this.auth.signIn(username, password);

        // TODO: Handle username is already taken

        // set the preferred username
        // We wait for this response so that we can check that the username doesn't fail
        const updateResponse = await this.auth.updateUserAttributes(
            signInResult,
            {preferred_username: preferredUsername},
        );
        console.info(`Updated preferred username attribute`);

        const session = signInResult.getSignInUserSession();
        this.user = {
            email: null,
            id: session.getIdToken().payload.sub,
            username: preferredUsername,
        };
    }

    async login(username: string, password: string): Promise<void> {
        let user: CognitoUser;
        try {
            user = await this.auth.signIn(username, password);
        } catch (e) {
            AuthService.checkInvalidCredentialsError(e);
            AuthService.checkUserNotFoundError(e);

            console.error(`Unexpected error ${JSON.stringify(e)}`);
            throw new Error('Unexpected error when signing in');
        }

        const token = user.getSignInUserSession().getIdToken();
        this.user = {
            id: token.payload.sub,
            username: token.payload.preferred_username,
            email: null,
        };
    }

    /**
     * Get the current user
     *
     * @return the user if they're logged in or null if they're not
     */
    public getUser(): EtchedUser | null {
        return this.user;
    }

    public refreshIfExpired(): Promise<CognitoUserSession> {
        // current session will refresh the tokens if they're close to expiring
        return this.auth.currentSession();
    }

    private static extractUserDetailsFromStorage(clock: ClockService): EtchedUser {
        const lastUserKey = `${LOCAL_COGNITO_PREFIX}.${environment.auth.userPoolWebClientId}.LastAuthUser`;
        const username = localStorage.getItem(lastUserKey);
        if (username == null) {
            return null;
        }

        // TODO: Add a test that checks that user is only set if BOTH id token and username are set
        const userIdTokenKey = `${LOCAL_COGNITO_PREFIX}.${environment.auth.userPoolWebClientId}.${username}.idToken`;
        const userIdToken = localStorage.getItem(userIdTokenKey);
        if (userIdToken == null) {
            return null;
        }

        return AuthService.extractUserDetailsFromIdToken(userIdToken, clock);
    }

    // @VisibleForTesting
    static extractUserDetailsFromIdToken(idToken: string, clock: ClockService): EtchedUser | null {
        const decoded = TokenDecoder.decodeToken<IdToken>(idToken);
        const tokenValid = this.refreshIsValid(decoded, clock);

        let user: EtchedUser | null;
        if (tokenValid) {
            console.info('token is valid');
            user = {
                id: decoded.sub,
                username: decoded.preferred_username,
                email: null,
            };
        } else {
            console.info('token is invalid');
            user = null;
        }
        return user;
    }

    // @VisibleForTesting
    static refreshIsValid(idToken: Token, clock: ClockService): boolean {
        // refresh expires 30 days after tokens
        // To simplify it (Yaseen being lazy), we consider refresh expiry to be 29 days after id
        // token expiry
        const idExp = idToken.exp * 1000;
        const refreshExp = idExp + (29 * 24 * 60 * 60 * 1000);
        const now = clock.nowMillis();
        return now <= refreshExp;
    }

    // @VisibleForTesting
    static checkInvalidCredentialsError(e: {code: string, message: string}) {
        // Invalid password error is in the format below
        // {
        //   "code": "NotAuthorizedException",
        //   "name": "NotAuthorizedException",
        //   "message": "Incorrect username or password."
        // }
        if (e.code === 'NotAuthorizedException' && e.message === 'Incorrect username or' +
            ' password.') {
            throw new InvalidCredentialsError();
        }
    }

    // @VisibleForTesting
    static checkUserNotFoundError(e: {code: string, message: string}) {
        // Response from Cognito is in the following format
        // {
        //   "code":"UserNotFoundException",
        //   "name":"UserNotFoundException",
        //   "message":"User does not exist."
        // }

        if (e.code === 'UserNotFoundException' && e.message === 'User does not exist.') {
            throw new UserNotFoundError();
        }
    }
}

export class AuthError extends Error {
    constructor(message?: string) {
        super(message);
    }
}
export class InvalidCredentialsError extends AuthError {
    public static MESSAGE = 'InvalidCredentialsError';

    constructor() {
        super(InvalidCredentialsError.MESSAGE);
    }
}

export class UserNotFoundError extends AuthError {
    public static MESSAGE = 'UserNotFoundError';

    constructor() {
        super(UserNotFoundError.MESSAGE);
    }
}
