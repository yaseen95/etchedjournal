import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryComponent } from './entry.component';
import { EtchedApiService } from '../../services/etched-api.service';

describe('EntryComponent', () => {
    let component: EntryComponent;
    let fixture: ComponentFixture<EntryComponent>;
    let etchedApiSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['login', 'getUser']);
        // By default getUser should return null
        etchedApiSpy.getUser.and.returnValue(null);

        TestBed.configureTestingModule({
            declarations: [EntryComponent],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
