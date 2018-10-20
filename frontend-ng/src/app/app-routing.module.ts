import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ConfigurePassphraseComponent } from './user/configure-passphrase/configure-passphrase.component';


const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'configure-passphrase', component: ConfigurePassphraseComponent},
];

@NgModule({
    exports: [RouterModule],
    imports: [
        RouterModule.forRoot(routes),
    ]
})
export class AppRoutingModule {
}
