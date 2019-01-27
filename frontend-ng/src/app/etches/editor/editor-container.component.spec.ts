import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY } from 'rxjs';
import { EncrypterService } from '../../services/encrypter.service';
import { EntriesService } from '../../services/entries.service';
import { EditorContainerComponent } from './editor-container.component';
import { EntryEditorComponent } from './entry-editor/entry-editor.component';
import { EntryTitleComponent } from './entry-title/entry-title.component';
import { EtchItemComponent } from './etch-item/etch-item.component';

describe('EditorContainerComponent', () => {
    let component: EditorContainerComponent;
    let fixture: ComponentFixture<EditorContainerComponent>;
    let entriesServiceSpy: any;
    let encrypterSpy: any;
    let encrypterService: EncrypterService;

    beforeEach(async(() => {
        entriesServiceSpy = jasmine.createSpyObj('EntriesService', ['getUser', 'createEntry']);
        // By default getUser should return null
        entriesServiceSpy.getUser.and.returnValue(null);
        entriesServiceSpy.createEntry.and.returnValue(EMPTY);

        encrypterSpy = jasmine.createSpyObj('Encrypter', ['encrypt']);

        encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        TestBed.configureTestingModule({
            declarations: [
                EditorContainerComponent,
                EntryTitleComponent,
                EntryEditorComponent,
                EtchItemComponent,
            ],
            providers: [
                {provide: EntriesService, useValue: entriesServiceSpy},
                {provide: EncrypterService, useValue: encrypterService},
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
