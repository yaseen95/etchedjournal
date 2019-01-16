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
import { JournalsContainerComponent } from './etches/journals/journals-container/journals-container.component';
import { CreateJournalComponent } from './etches/journals/create-journal/create-journal.component';
import { EnterPassphraseContainer } from './user/passphrase/enter-passphrase/enter-passphrase-container/enter-passphrase-container.component';
import { PassphraseGuard } from './user/passphrase/passphrase.guard';
import { LogoutComponent } from './user/logout/logout.component';
import { GenerateContainerComponent } from './key-pairs/generate/generate-container.component';

const GUARDS = [AuthGuard, PassphraseGuard];

export const ALL_ROUTES: Routes = [
    //
    // UNAUTHENTICATED ROUTES
    //
    {path: '', redirectTo: EtchedRoutes.JOURNALS_PATH, pathMatch: 'full'},
    {path: EtchedRoutes.LOGIN_PATH, component: LoginContainerComponent},
    {path: EtchedRoutes.REGISTER_PATH, component: RegisterContainerComponent},

    //
    // AUTHENTICATED ROUTES
    //
    {
        path: 'configure-passphrase',
        component: ConfigurePassphraseComponent,
        canActivate: [AuthGuard],
    },
    {
        path: EtchedRoutes.ENTER_PASSPHRASE_PATH,
        component: EnterPassphraseContainer,
        canActivate: [AuthGuard],
    },
    {
        path: EtchedRoutes.LOGOUT_PATH,
        component: LogoutComponent,
        // TODO: Do we need to be logged in, in order to logout
        canActivate: [AuthGuard],
    },
    {
        path: EtchedRoutes.KEYS_GENERATE_PATH,
        component: GenerateContainerComponent,
        canActivate: [AuthGuard],
    },

    //
    // AUTHENTICATED AND PASSPHRASE REQUIRED ROUTES
    //

    // JOURNALS
    {
        path: EtchedRoutes.JOURNALS_PATH,
        component: JournalsContainerComponent,
        canActivate: GUARDS,
    },
    {
        path: EtchedRoutes.JOURNALS_CREATE_PATH,
        component: CreateJournalComponent,
        canActivate: GUARDS,
    },
    {
        path: 'journals/:id',
        component: EntryListContainerComponent,
        canActivate: GUARDS,
    },

    // ENTRIES
    {
        path: EtchedRoutes.ENTRIES_CREATE_PATH,
        component: EditorContainerComponent,
        canActivate: GUARDS,
    },
    {
        path: 'entries/:id',
        component: ExistingEntryEditorContainerComponent,
        canActivate: GUARDS,
    },
];

@NgModule({
    exports: [RouterModule],
    imports: [
        RouterModule.forRoot(ALL_ROUTES),
    ]
})
export class AppRoutingModule {
}
