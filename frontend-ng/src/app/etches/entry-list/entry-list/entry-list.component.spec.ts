import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { OwnerType } from '../../../models/owner-type';
import { TestUtils } from '../../../utils/test-utils.spec';
import { EntryListItemComponent } from '../entry-list-item/entry-list-item.component';
import { EntryListComponent } from './entry-list.component';

describe('EntryListComponent', () => {
    let component: EntryListComponent;
    let fixture: ComponentFixture<EntryListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EntryListComponent, EntryListItemComponent],
            imports: [RouterTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryListComponent);
        component = fixture.componentInstance;
        component.entries = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('empty list displays "No entries"', () => {
        component.entries = [];
        fixture.detectChanges();

        const p = TestUtils.queryExpectOne(fixture.debugElement, 'p');
        expect(p.nativeElement.innerText).toEqual('No entries');
    });

    it('displays entries', () => {
        component.entries = [
            {
                id: 'id1',
                timestamp: 1_000,
                owner: 'owner1',
                ownerType: OwnerType.USER,
                content: 'title1',
                keyPairId: 'kpId',
                journalId: 'jid',
                version: 1,
            },
            {
                id: 'id2',
                timestamp: 2_000,
                owner: 'owner2',
                ownerType: OwnerType.USER,
                content: 'title2',
                keyPairId: 'kpId',
                journalId: 'jid',
                version: 1,
            },
        ];
        fixture.detectChanges();

        // Heading should be displayed
        const heading = TestUtils.queryExpectOne(fixture.debugElement, 'h3');
        expect(heading.nativeElement.innerText).toEqual('Entries');

        const listItems = fixture.debugElement.queryAll(By.css('app-entry-list-item'));
        expect(listItems.length).toEqual(2);
    });
});
