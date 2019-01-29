import { HttpClientModule } from '@angular/common/http';
import { async, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { EntryEditorComponent } from './etches/editor/entry-editor/entry-editor.component';
import { EntryTitleComponent } from './etches/editor/entry-title/entry-title.component';
import { EtchItemComponent } from './etches/editor/etch-item/etch-item.component';
import { NavComponent } from './nav/nav.component';
import { JournalStore } from './stores/journal.store';
import { FakeJournalStore } from './stores/journal.store.spec';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { SpinnerComponent } from './utils/spinner/spinner.component';

describe('AppComponent', () => {

    const store = new FakeJournalStore();

    beforeEach(async(() => {
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
            imports: [
                RouterTestingModule,
                BrowserModule,
                HttpClientModule,
                ReactiveFormsModule,
            ],
            providers: [
                {provide: JournalStore, useValue: store},
            ]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });
});
