import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { JournalsContainerComponent } from './journals-container.component';
import { EncrypterService } from '../../../services/encrypter.service';
import { EtchedApiService } from '../../../services/etched-api.service';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { JournalListComponent } from '../journal-list/journal-list.component';
import { JournalListItemComponent } from '../journal-list-item/journal-list-item.component';
import { CreateJournalComponent } from '../create-journal/create-journal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TestUtils } from '../../../utils/test-utils.spec';
import { OwnerType } from '../../../models/owner-type';
import { By } from '@angular/platform-browser';

describe('JournalsContainerComponent', () => {
    let component: JournalsContainerComponent;
    let fixture: ComponentFixture<JournalsContainerComponent>;
    let etchedApiSpy: any;
    let encrypterSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['getJournals']);
        encrypterSpy = jasmine.createSpyObj('Encrypter', ['decrypt']);
        etchedApiSpy.getJournals.and.returnValue(of([]));

        const encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        TestBed.configureTestingModule({
            declarations: [
                JournalsContainerComponent,
                SpinnerComponent,
                JournalListComponent,
                JournalListItemComponent,
                CreateJournalComponent,
            ],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
                {provide: EncrypterService, useValue: encrypterService},
            ],
            imports: [
                RouterTestingModule,
                ReactiveFormsModule,
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JournalsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('displays spinner when getting journals', () => {
        component.state = component.FETCHING;
        fixture.detectChanges();
        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Getting journals');
    });

    it('displays spinner when decrypting journals', () => {
        component.state = component.DECRYPTING;
        fixture.detectChanges();
        const spinnerText = TestUtils.queryExpectOne(fixture.debugElement, 'spinner p');
        expect(spinnerText.nativeElement.innerText).toEqual('Decrypting journals');
    });

    it('displays list of journals', () => {
        component.state = component.DECRYPTED;
        component.journals = [];
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'app-journal-list');
    });

    it('decrypts journal content', fakeAsync(() => {
        etchedApiSpy.getJournals.and.returnValue(of(
            [
                {
                    id: '1234567890abcdef',
                    timestamp: 0,
                    ownerType: OwnerType.USER,
                    owner: 'tester1',
                    content: 'journal1 encrypted content',
                },
                {
                    id: '0000000000000000',
                    timestamp: 1,
                    ownerType: OwnerType.USER,
                    owner: 'tester1',
                    content: 'journal2 encrypted content',
                },
            ]
        ));

        encrypterSpy.decrypt.and.returnValues(Promise.resolve('dec1'), Promise.resolve('dec2'));
        component.ngOnInit();
        expect(component.state).toEqual(component.DECRYPTING);

        tick();
        fixture.detectChanges();

        // Should decrypt the returned journal content
        expect(component.journals[0].content).toEqual('dec1');
        expect(component.journals[1].content).toEqual('dec2');
        expect(component.state).toEqual(component.DECRYPTED);

        // Decrypted content is displayed as the journal title
        const listItemDes = fixture.debugElement.queryAll(By.css('h4.journal-title'));
        expect(listItemDes.length).toEqual(2);
        expect(listItemDes[0].nativeElement.innerText).toEqual('dec1');
        expect(listItemDes[1].nativeElement.innerText).toEqual('dec2');
    }));
});