import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurePassphraseComponent } from './user/configure-passphrase/configure-passphrase.component';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { EntryListContainerComponent } from './etches/entry-list/entry-list-container.component';
import { ExistingEntryEditorContainerComponent } from './etches/editor/existing-entry-editor-container/existing-entry-editor-container.component';
import { RegisterContainerComponent } from './user/register/register-container/register-container.component';
import { LoginContainerComponent } from './user/login/login-container/login-container.component';
import { AuthGuard } from './auth/auth.guard';
import { EtchedRoutes } from './app-routing-utils';

export const AUTH_ROUTES: Routes = [
    {
        path: 'configure-passphrase',
        component: ConfigurePassphraseComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'entries',
        component: EntryListContainerComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'entries/new',
        component: EditorContainerComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'entries/:id',
        component: ExistingEntryEditorContainerComponent,
        canActivate: [AuthGuard],
    },
];

export const NO_AUTH_ROUTES: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: EtchedRoutes.LOGIN_PATH, component: LoginContainerComponent},
    {path: EtchedRoutes.REGISTER_PATH, component: RegisterContainerComponent},
];

export const ALL_ROUTES: Routes = AUTH_ROUTES.concat(NO_AUTH_ROUTES);

@NgModule({
    exports: [RouterModule],
    imports: [
        RouterModule.forRoot(ALL_ROUTES),
    ]
})
export class AppRoutingModule {
}
