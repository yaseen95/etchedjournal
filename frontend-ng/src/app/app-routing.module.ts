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

export const ALL_ROUTES: Routes = [
    //
    // UNAUTHENTICATED ROUTES
    //
    {path: '', redirectTo: 'login', pathMatch: 'full'},
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

    // JOURNALS
    {
        path: EtchedRoutes.JOURNALS_PATH,
        component: JournalsContainerComponent,
        canActivate: [AuthGuard],
    },
    {
        path: EtchedRoutes.JOURNALS_CREATE_PATH,
        component: CreateJournalComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'journals/:id',
        component: EntryListContainerComponent,
        canActivate: [AuthGuard],
    },

    // ENTRIES
    {
        path: EtchedRoutes.ENTRIES_CREATE_PATH,
        component: EditorContainerComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'entries/:id',
        component: ExistingEntryEditorContainerComponent,
        canActivate: [AuthGuard],
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
