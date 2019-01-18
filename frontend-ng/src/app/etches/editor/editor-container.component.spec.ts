import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EncrypterService } from '../../services/encrypter.service';
import { EtchedApiService } from '../../services/etched-api.service';
import { EditorContainerComponent } from './editor-container.component';
import { EntryEditorComponent } from './entry-editor/entry-editor.component';
import { EntryTitleComponent } from './entry-title/entry-title.component';
import { EtchItemComponent } from './etch-item/etch-item.component';

describe('EditorContainerComponent', () => {
    let component: EditorContainerComponent;
    let fixture: ComponentFixture<EditorContainerComponent>;
    let etchedApiSpy: any;
    let encrypterSpy: any;
    let encrypterService: EncrypterService;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['getUser']);
        // By default getUser should return null
        etchedApiSpy.getUser.and.returnValue(null);

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
                {provide: EtchedApiService, useValue: etchedApiSpy},
                {provide: EncrypterService, useValue: encrypterService},
            ],
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
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
