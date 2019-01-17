import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { EncrypterService } from '../../services/encrypter.service';
import { EtchedApiService } from '../../services/etched-api.service';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { TestUtils } from '../../utils/test-utils.spec';
import { EntryListContainerComponent } from './entry-list-container.component';
import { EntryListItemComponent } from './entry-list-item/entry-list-item.component';
import { EntryListComponent } from './entry-list/entry-list.component';

describe('EntryListContainerComponent', () => {
    let component: EntryListContainerComponent;
    let fixture: ComponentFixture<EntryListContainerComponent>;
    let etchedApi: any;
    let encrypter: any;
    let encrypterService: EncrypterService;

    beforeEach(async(() => {
        etchedApi = jasmine.createSpyObj('EtchedApiService', ['getEntries']);
        // By default getUser should return null
        etchedApi.getEntries.and.returnValue(of([]));
        encrypter = jasmine.createSpyObj('Encrypter', ['encrypt']);
        encrypter.keyPairId = 'kpId';

        encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypter;

        TestBed.configureTestingModule({
            declarations: [
                EntryListContainerComponent,
                EntryListComponent,
                EntryListItemComponent,
                SpinnerComponent,
            ],
            providers: [
                {provide: EtchedApiService, useValue: etchedApi},
                {provide: EncrypterService, useValue: encrypterService},
            ],
            imports: [
                RouterTestingModule,
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
        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Getting entries');
    });

    it('displays decrypting spinner', () => {
        component.inFlight = false;
        component.decrypting = true;
        fixture.detectChanges();

        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Decrypting entries');
    });

    it('displays entries after getting and decrypting', () => {
        component.inFlight = false;
        component.decrypting = false;
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, 'app-entry-list');
    });
});
