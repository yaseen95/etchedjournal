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
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { SpinnerComponent } from './utils/spinner/spinner.component';

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
                NavComponent,
                EtchItemComponent,
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

    // it('should render title in a h1 tag', () => {
    //     const fixture = TestBed.createComponent(AppComponent);
    //     fixture.detectChanges();
    //     const compiled = fixture.debugElement.nativeElement;
    //     expect(compiled.querySelector('h1').textContent).toContain('Welcome to frontend-ng!');
    // });
});
