import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MobxAngularModule } from 'mobx-angular';
import { EntryV1 } from '../../../models/entry/entry-v1';
import { FakeEntryStore } from '../../../services/fakes.service.spec';
import { EntryStore } from '../../../stores/entry.store';
import { TestUtils } from '../../../utils/test-utils.spec';
import { EntryListItemComponent } from '../entry-list-item/entry-list-item.component';
import { EntryListComponent } from './entry-list.component';
import createEntryEntity = TestUtils.createEntryEntity;

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
        entryStore.entities = [createEntryEntity({ id: 'id1' }), createEntryEntity({ id: 'id2' })];

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
