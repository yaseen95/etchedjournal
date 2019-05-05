import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { JournalV1 } from '../../../models/journal/journal-v1';
import { FakeJournalStore } from '../../../services/fakes.service.spec';
import { JournalEntity } from '../../../services/models/journal-entity';
import { JournalStore } from '../../../stores/journal.store';
import { EditableText } from '../../../utils/editable-text/editable-text.component';
import { TestUtils } from '../../../utils/test-utils.spec';
import { JournalListItemComponent } from './journal-list-item.component';
import createJournalEntity = TestUtils.createJournalEntity;

describe('JournalListItemComponent', () => {
    let component: JournalListItemComponent;
    let fixture: ComponentFixture<JournalListItemComponent>;
    const entity: JournalEntity = createJournalEntity({ id: 'abcdef' });
    const journal: JournalV1 = new JournalV1({ name: 'work journal', created: 1_000 });
    let journalStore: FakeJournalStore;

    beforeEach(async(() => {
        journalStore = new FakeJournalStore();

        TestBed.configureTestingModule({
            declarations: [JournalListItemComponent, EditableText],
            imports: [RouterTestingModule],
            providers: [{ provide: JournalStore, useValue: journalStore }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JournalListItemComponent);
        component = fixture.componentInstance;
        component.journal = journal;
        component.entity = entity;
        fixture.detectChanges();
    });

    it('links to journal page', () => {
        const de = fixture.debugElement.query(By.css('a'));
        expect(de.properties.href).toEqual('/journals/abcdef');
        expect(de.nativeElement.innerText).toEqual('work journal');
    });

    it('updates journal on journal rename', () => {
        const updateJournalSpy = spyOn(journalStore, 'updateJournal');
        component.renameJournal('updated name');

        expect(updateJournalSpy).toHaveBeenCalledTimes(1);
        const expectedJournal = { ...journal, name: 'updated name' };
        expect(updateJournalSpy).toHaveBeenCalledWith(entity.id, expectedJournal);
    });

    it('does not update journal if name does not change', () => {
        const updateJournalSpy = spyOn(journalStore, 'updateJournal');
        component.renameJournal(journal.name);
        expect(updateJournalSpy).toHaveBeenCalledTimes(0);
    });
});
