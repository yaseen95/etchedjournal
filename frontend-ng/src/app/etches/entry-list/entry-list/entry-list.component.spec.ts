import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { runInAction } from 'mobx';
import { MobxAngularModule } from 'mobx-angular';
import { EntryV1 } from '../../../models/entry/entry-v1';
import { FakeEntryStore } from '../../../services/fakes.service.spec';
import { OwnerType } from '../../../services/models/owner-type';
import { EntryStore } from '../../../stores/entry.store';
import { TestUtils } from '../../../utils/test-utils.spec';
import { EntryListItemComponent } from '../entry-list-item/entry-list-item.component';
import { EntryListComponent } from './entry-list.component';

describe('EntryListComponent', () => {
    let component: EntryListComponent;
    let fixture: ComponentFixture<EntryListComponent>;
    let entryStore: EntryStore;

    beforeEach(async(() => {
        entryStore = new FakeEntryStore();
        TestBed.configureTestingModule({
            declarations: [EntryListComponent, EntryListItemComponent],
            imports: [RouterTestingModule, MobxAngularModule],
            providers: [{ provide: EntryStore, useValue: entryStore }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('empty list displays "No entries"', () => {
        entryStore.entities = [];
        entryStore.entries = [];
        fixture.detectChanges();

        const p = TestUtils.queryExpectOne(fixture.debugElement, 'p');
        expect(p.nativeElement.innerText).toEqual('No entries');
    });

    it('displays entries', () => {
        const entry1 = new EntryV1({ content: 'title1', timestamp: 1_000 });
        const entry2 = new EntryV1({ content: 'title2', timestamp: 2_000 });

        entryStore.entries = [entry1, entry2];
        entryStore.entriesById = new Map().set('id1', entry1).set('id2', entry2);
        entryStore.entities = [
            {
                id: 'id1',
                timestamp: 1_000,
                owner: 'owner1',
                ownerType: OwnerType.USER,
                content: 'ciphertext1',
                keyPairId: 'kpId',
                journalId: 'jid',
                version: 1,
                schema: '1.0.0',
            },
            {
                id: 'id2',
                timestamp: 2_000,
                owner: 'owner2',
                ownerType: OwnerType.USER,
                content: 'ciphertext2',
                keyPairId: 'kpId',
                journalId: 'jid',
                version: 1,
                schema: '1.0.0',
            },
        ];

        fixture.detectChanges();

        // Heading should be displayed
        const heading = TestUtils.queryExpectOne(fixture.debugElement, 'h3');
        expect(heading.nativeElement.innerText).toEqual('Entries');

        const listItems = fixture.debugElement.queryAll(By.css('app-entry-list-item'));
        expect(listItems.length).toEqual(2);
        expect(listItems[0].nativeElement.innerText).toContain('title1');
        expect(listItems[1].nativeElement.innerText).toContain('title2');
    });
});
