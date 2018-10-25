import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryEditorComponent } from './entry-editor.component';
import { EtchedApiService } from '../../services/etched-api.service';

describe('EntryEditorComponent', () => {
    let component: EntryEditorComponent;
    let fixture: ComponentFixture<EntryEditorComponent>;
    let etchedApiSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['getUser']);
        // By default getUser should return null
        etchedApiSpy.getUser.and.returnValue(null);

        TestBed.configureTestingModule({
            declarations: [EntryEditorComponent],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
            ],
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
