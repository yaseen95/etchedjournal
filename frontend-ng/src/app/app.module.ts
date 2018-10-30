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
import { EntryComponent } from './etches/entry/entry.component';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { EntryEditorComponent } from './etches/editor/entry-editor/entry-editor.component';
import { EntryTitleComponent } from './etches/editor/entry-title/entry-title.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        SpinnerComponent,
        ConfigurePassphraseComponent,
        EntryComponent,
        EditorContainerComponent,
        EntryEditorComponent,
        EntryTitleComponent
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
