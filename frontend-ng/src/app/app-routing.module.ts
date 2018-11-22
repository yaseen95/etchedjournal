import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ConfigurePassphraseComponent } from './user/configure-passphrase/configure-passphrase.component';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { EntryListContainerComponent } from './etches/entry-list/entry-list-container.component';
import { ExistingEntryEditorContainerComponent } from './etches/editor/existing-entry-editor-container/existing-entry-editor-container.component';
import { RegisterContainerComponent } from './user/register/register-container/register-container.component';


const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterContainerComponent},
    {path: 'configure-passphrase', component: ConfigurePassphraseComponent},
    {path: 'entries/new', component: EditorContainerComponent},
    {path: 'entries/:id', component: ExistingEntryEditorContainerComponent},
    {path: 'entries', component: EntryListContainerComponent},
];

@NgModule({
    exports: [RouterModule],
    imports: [
        RouterModule.forRoot(routes),
    ]
})
export class AppRoutingModule {
}
