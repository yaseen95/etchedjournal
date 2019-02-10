import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';
import { AuthService, UsernameTakenError } from '../../../services/auth.service';
import { RegisterRequest } from '../../../services/dtos/register-request';

@Component({
    selector: 'app-register-container',
    templateUrl: './register-container.component.html',
    styleUrls: ['./register-container.component.css'],
})
export class RegisterContainerComponent {
    public NOT_REGISTERED = 1;
    public REGISTERING = 2;
    public USERNAME_TAKEN = 3;
    public REGISTERED = 4;

    public state: number;

    /**
     * Used by RegisterComponent to display the username if they attempt to register with a
     * taken username.
     */
    public username: string;

    constructor(private authService: AuthService, private router: Router) {
        this.state = this.NOT_REGISTERED;
    }

    public onRegister(req: RegisterRequest) {
        console.info(`Registering ${req.username}`);
        this.state = this.REGISTERING;

        this.authService
            .register(req.username, req.password)
            .then(() => {
                this.router.navigate([EtchedRoutes.KEYS_GENERATE_PATH]);
                this.state = this.REGISTERED;
            })
            .catch(e => {
                if (e.message === UsernameTakenError.MESSAGE) {
                    this.state = this.USERNAME_TAKEN;
                }
                this.username = req.username;
            });
    }
}
