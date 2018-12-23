import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalListComponent } from './journal-list.component';
import { JournalListItemComponent } from '../journal-list-item/journal-list-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { JournalEntity } from '../../../models/journal-entity';
import { OwnerType } from '../../../models/owner-type';
import { By } from '@angular/platform-browser';

describe('JournalListComponent', () => {
    let component: JournalListComponent;
    let fixture: ComponentFixture<JournalListComponent>;
    let journals: JournalEntity[];

    beforeEach(async(() => {

        journals = [
            {
                id: '1234567890abcdef',
                timestamp: 0,
                ownerType: OwnerType.USER,
                owner: 'tester1',
                content: 'journal1 content',
            },
            {
                id: '0000000000000000',
                timestamp: 1,
                ownerType: OwnerType.USER,
                owner: 'tester1',
                content: 'journal2 content'
            }
        ];

        TestBed.configureTestingModule({
            declarations: [
                JournalListComponent,
                JournalListItemComponent,
            ],
            imports: [
                RouterTestingModule,
                ReactiveFormsModule,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JournalListComponent);
        component = fixture.componentInstance;
        component.journals = journals;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('lists journals', () => {
        const de = fixture.debugElement.queryAll(By.css('app-journal-list-item'));
        expect(de.length).toEqual(2);
    })
});
