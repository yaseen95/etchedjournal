import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './user/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './user/register/register.component';
import { SpinnerComponent } from './utils/spinner/spinner.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigurePassphraseComponent } from './user/configure-passphrase/configure-passphrase.component';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { EntryEditorComponent } from './etches/editor/entry-editor/entry-editor.component';
import { EntryTitleComponent } from './etches/editor/entry-title/entry-title.component';
import { EntryListContainerComponent } from './etches/entry-list/entry-list-container.component';
import { EntryListComponent } from './etches/entry-list/entry-list/entry-list.component';
import { EntryListItemComponent } from './etches/entry-list/entry-list-item/entry-list-item.component';
import { ExistingEntryEditorContainerComponent } from './etches/editor/existing-entry-editor-container/existing-entry-editor-container.component';
import { RegisterContainerComponent } from './user/register/register-container/register-container.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        SpinnerComponent,

        // Editor components
        EditorContainerComponent,
        EntryEditorComponent,
        EntryTitleComponent,
        ExistingEntryEditorContainerComponent,

        // Entry list components
        EntryListContainerComponent,
        EntryListComponent,
        EntryListItemComponent,

        // Register components
        RegisterContainerComponent,
        ConfigurePassphraseComponent,
        RegisterComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
