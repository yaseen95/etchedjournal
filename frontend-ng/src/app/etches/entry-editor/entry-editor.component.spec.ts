import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryEditorComponent } from './entry-editor.component';
import { EtchedApiService } from '../../services/etched-api.service';
import { EntryTitleComponent } from './entry-title/entry-title.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EntryEditorComponent', () => {
    let component: EntryEditorComponent;
    let fixture: ComponentFixture<EntryEditorComponent>;
    let etchedApiSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['getUser']);
        // By default getUser should return null
        etchedApiSpy.getUser.and.returnValue(null);

        TestBed.configureTestingModule({
            declarations: [EntryEditorComponent, EntryTitleComponent],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
            ],
            imports: [ReactiveFormsModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
