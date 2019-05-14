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
import { FakeEtchQueue, FakeJournalStore } from './services/fakes.service.spec';
import { SecureStorageService } from './services/secure-storage.service';
import { EtchQueue } from './stores/etch/etch-queue';
import { JournalStore } from './stores/journal.store';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { SpinnerComponent } from './utils/spinner/spinner.component';
import { TestUtils } from './utils/test-utils.spec';
import createEtch = TestUtils.createEtch;

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let queue: FakeEtchQueue;
    let secureStorage: SecureStorageService;

    beforeEach(async(() => {
        const journalStore = new FakeJournalStore();
        queue = new FakeEtchQueue();

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
            providers: [
                { provide: JournalStore, useValue: journalStore },
                { provide: EtchQueue, useValue: queue },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(AppComponent);

        secureStorage = TestBed.get(SecureStorageService);
    }));

    it('should create the app', () => {
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it('flushes storage on unload', () => {
        const spyStorageFlush = spyOn(secureStorage, 'flush');
        window.dispatchEvent(new Event('beforeunload'));
        expect(spyStorageFlush).toHaveBeenCalledTimes(1);
    });

    it('flushes any queued etches', () => {
        queue.put('eid', [createEtch('foobar')]);
        const flushSpy = spyOn(queue, 'flush');
        window.dispatchEvent(new Event('beforeunload'));
        expect(flushSpy).toHaveBeenCalledTimes(1);
    });

    it('prevents unload if etches are queued', () => {
        queue.put('eid', [createEtch('foobar')]);
        const e = new Event('beforeunload') as BeforeUnloadEvent;
        e.returnValue = false;
        window.dispatchEvent(e);
        expect(e.returnValue).toEqual(true);
    });

    it('does not prevent unload if no etches are queued', () => {
        const e = new Event('beforeunload') as BeforeUnloadEvent;

        // Creating the event in the above line sets `returnValue = true` for some reason. In
        // reality it is usually just ''.
        e.returnValue = '';
        // As soon as we set it to '' it becomes `false` oddly enough

        window.dispatchEvent(e);
        expect(e.returnValue).toEqual(false);
    });
});
