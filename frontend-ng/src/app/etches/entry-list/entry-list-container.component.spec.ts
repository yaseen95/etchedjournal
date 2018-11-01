import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryListContainerComponent } from './entry-list-container.component';
import { EntryListComponent } from './entry-list/entry-list.component';
import { EntryListItemComponent } from './entry-list-item/entry-list-item.component';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { EtchedApiService } from '../../services/etched-api.service';
import TestUtils from '../../utils/test-utils.spec';
import { of } from 'rxjs';

describe('EntryListContainerComponent', () => {
    let component: EntryListContainerComponent;
    let fixture: ComponentFixture<EntryListContainerComponent>;
    let etchedApi: any;

    beforeEach(async(() => {
        etchedApi = jasmine.createSpyObj('EtchedApiService', ['getEntries']);
        // By default getUser should return null
        etchedApi.getEntries.and.returnValue(of([]));

        TestBed.configureTestingModule({
            declarations: [
                EntryListContainerComponent,
                EntryListComponent,
                EntryListItemComponent,
                SpinnerComponent,
            ],
            providers: [
                {provide: EtchedApiService, useValue: etchedApi},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryListContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('displays getting entries spinner', () => {
        component.inFlight = true;
        fixture.detectChanges();

        // spinner p will match any p element that is a descendant of spinner
        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Getting entries');
    });

    it('displays decrypting spinner', () => {
        component.inFlight = false;
        component.decrypting = true;
        fixture.detectChanges();

        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Decrypting entries');
    });

    it('displays entries after getting and decrypting', () => {
        component.inFlight = false;
        component.decrypting = false;
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, 'app-entry-list');
    });
});
