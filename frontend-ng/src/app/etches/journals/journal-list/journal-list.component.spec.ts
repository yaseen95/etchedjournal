import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { JournalV1 } from '../../../models/journal/journal-v1';
import { JournalEntity } from '../../../services/models/journal-entity';
import { TestUtils } from '../../../utils/test-utils.spec';
import { JournalListItemComponent } from '../journal-list-item/journal-list-item.component';
import { JournalListComponent } from './journal-list.component';
import createJournalEntity = TestUtils.createJournalEntity;

describe('JournalListComponent', () => {
    let component: JournalListComponent;
    let fixture: ComponentFixture<JournalListComponent>;
    const entities: JournalEntity[] = [
        createJournalEntity({ id: '1' }),
        createJournalEntity({ id: '2' }),
    ];
    const journalsById: Map<string, JournalV1> = new Map();
    journalsById.set('1', new JournalV1({ name: 'journal1', created: 1_000 }));
    journalsById.set('2', new JournalV1({ name: 'journal2', created: 2_000 }));

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JournalListComponent, JournalListItemComponent],
            imports: [RouterTestingModule, ReactiveFormsModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JournalListComponent);
        component = fixture.componentInstance;
        component.entities = entities;
        component.journalsById = journalsById;
        fixture.detectChanges();
    });

    it('lists journals', () => {
        const de = fixture.debugElement.queryAll(By.css('app-journal-list-item'));
        expect(de.length).toEqual(2);
    });
});
