import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { JournalEntity } from '../../../models/journal-entity';
import { OwnerType } from '../../../models/owner-type';
import { JournalListItemComponent } from './journal-list-item.component';

describe('JournalListItemComponent', () => {
    let component: JournalListItemComponent;
    let fixture: ComponentFixture<JournalListItemComponent>;
    let journal: JournalEntity;

    beforeEach(async(() => {
        journal = {
            id: '1234567890abcdef',
            content: 'content',
            owner: 'owner',
            ownerType: OwnerType.USER,
            timestamp: 0,
            keyPairId: 'kpId',
        };
        TestBed.configureTestingModule({
            declarations: [JournalListItemComponent],
            imports: [RouterTestingModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JournalListItemComponent);
        component = fixture.componentInstance;
        component.journal = journal;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('links to journal page', () => {
        const de = fixture.debugElement.query(By.css('a'));
        expect(de.properties.href).toEqual('/journals/1234567890abcdef');
    });
});
