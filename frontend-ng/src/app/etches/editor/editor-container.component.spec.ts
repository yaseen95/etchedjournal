import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EntryStore } from '../../stores/entry.store';
import { FakeEntryStore } from '../../stores/entry.store.spec';
import { EditorContainerComponent } from './editor-container.component';
import { EntryEditorComponent } from './entry-editor/entry-editor.component';
import { EntryTitleComponent } from './entry-title/entry-title.component';
import { EtchItemComponent } from './etch-item/etch-item.component';

describe('EditorContainerComponent', () => {
    let component: EditorContainerComponent;
    let fixture: ComponentFixture<EditorContainerComponent>;
    let store: EntryStore;

    beforeEach(async(() => {
        store = new FakeEntryStore();

        TestBed.configureTestingModule({
            declarations: [
                EditorContainerComponent,
                EntryTitleComponent,
                EntryEditorComponent,
                EtchItemComponent,
            ],
            providers: [
                {provide: EntryStore, useValue: store},
            ],
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TODO: Add some tests here
});
