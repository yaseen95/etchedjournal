import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { EntryEditorComponent } from './etches/editor/entry-editor/entry-editor.component';
import { EntryTitleComponent } from './etches/editor/entry-title/entry-title.component';
import { EtchItemComponent } from './etches/editor/etch-item/etch-item.component';
import { NavComponent } from './nav/nav.component';
import { FakeJournalStore } from './services/fakes.service.spec';
import { SecureStorageService } from './services/secure-storage.service';
import { JournalStore } from './stores/journal.store';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { SpinnerComponent } from './utils/spinner/spinner.component';

describe('AppComponent', () => {
    let spyStorageFlush: any;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async(() => {
        const journalStore = new FakeJournalStore();
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                RegisterComponent,
                LoginComponent,
                SpinnerComponent,
                EditorContainerComponent,
                EntryTitleComponent,
                EntryEditorComponent,
                NavComponent,
                EtchItemComponent,
            ],
            imports: [RouterTestingModule, BrowserModule, HttpClientModule, ReactiveFormsModule],
            providers: [{ provide: JournalStore, useValue: journalStore }],
        }).compileComponents();
        fixture = TestBed.createComponent(AppComponent);

        const secureStorage = TestBed.get(SecureStorageService);
        spyStorageFlush = spyOn(secureStorage, 'flush');
    }));

    it('should create the app', () => {
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it('flushes storage on unload', () => {
        window.dispatchEvent(new Event('beforeunload'));
        expect(spyStorageFlush).toHaveBeenCalledTimes(1);
    });
});
