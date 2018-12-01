import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RegisterComponent } from './user/register/register.component';
import { LoginComponent } from './user/login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from './utils/spinner/spinner.component';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorContainerComponent } from './etches/editor/editor-container.component';
import { EntryTitleComponent } from './etches/editor/entry-title/entry-title.component';
import { EntryEditorComponent } from './etches/editor/entry-editor/entry-editor.component';

describe('AppComponent', () => {
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
            ],
            imports: [
                RouterTestingModule,
                BrowserModule,
                HttpClientModule,
                ReactiveFormsModule,
            ],
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'frontend-ng'`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.title).toEqual('Etched - Encrypted Journal');
    });

    // it('should render title in a h1 tag', () => {
    //     const fixture = TestBed.createComponent(AppComponent);
    //     fixture.detectChanges();
    //     const compiled = fixture.debugElement.nativeElement;
    //     expect(compiled.querySelector('h1').textContent).toContain('Welcome to frontend-ng!');
    // });
});
