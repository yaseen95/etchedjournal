import { AppRoutingModule, ALL_ROUTES } from './app-routing.module';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { LoginContainerComponent } from './user/login/login-container/login-container.component';
import { RegisterContainerComponent } from './user/register/register-container/register-container.component';
import { EntryListContainerComponent } from './etches/entry-list/entry-list-container.component';
import { ConfigurePassphraseComponent } from './user/configure-passphrase/configure-passphrase.component';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { ExistingEntryEditorContainerComponent } from './etches/editor/existing-entry-editor-container/existing-entry-editor-container.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { JournalsContainerComponent } from './etches/journals/journals-container/journals-container.component';
import { CreateJournalComponent } from './etches/journals/create-journal/create-journal.component';
import { EnterPassphraseContainer } from './user/passphrase/enter-passphrase/enter-passphrase-container/enter-passphrase-container.component';
import { LogoutComponent } from './user/logout/logout.component';
import { GenerateContainerComponent } from './key-pairs/generate/generate-container.component';

describe('AppRoutingModule', () => {
    let location: Location;
    let router: Router;
    let fixture;


    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [
                BrowserModule,
                HttpClientModule,
                ReactiveFormsModule,
                RouterTestingModule.withRoutes(ALL_ROUTES),
            ],
            declarations: [
                AppComponent,
                ConfigurePassphraseComponent,
                EditorContainerComponent,
                EntryListContainerComponent,
                ExistingEntryEditorContainerComponent,
                LoginContainerComponent,
                RegisterContainerComponent,
                JournalsContainerComponent,
                CreateJournalComponent,
                EnterPassphraseContainer,
                LogoutComponent,
                GenerateContainerComponent,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        router = TestBed.get(Router);
        location = TestBed.get(Location);

        fixture = TestBed.createComponent(AppComponent);
    });

    it('navigate to "" redirects you to /login', fakeAsync(() => {
        // https://codecraft.tv/courses/angular/unit-testing/routing/
        // https://semaphoreci.com/community/tutorials/testing-routes-in-angular-2

        fixture.ngZone.run(() => {
            router.initialNavigation();
            tick();
            router.navigate(['']);
            expect(location.path()).toBe('/login');
        });
    }));
});
