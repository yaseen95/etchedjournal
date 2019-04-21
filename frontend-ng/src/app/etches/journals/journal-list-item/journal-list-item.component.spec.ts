import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { JournalV1 } from '../../../models/journal/journal-v1';
import { JournalEntity } from '../../../services/models/journal-entity';
import { OwnerType } from '../../../services/models/owner-type';
import { Schema } from '../../../services/models/schema';
import { JournalListItemComponent } from './journal-list-item.component';

describe('JournalListItemComponent', () => {
    let component: JournalListItemComponent;
    let fixture: ComponentFixture<JournalListItemComponent>;
    const entity: JournalEntity = {
        id: '1234567890abcdef',
        content: 'content',
        owner: 'owner',
        ownerType: OwnerType.USER,
        timestamp: 0,
        keyPairId: 'kpId',
        version: 1,
        schema: Schema.V1_0,
    };
    const journal: JournalV1 = new JournalV1({ name: 'work journal', created: 1_000 });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JournalListItemComponent],
            imports: [RouterTestingModule],
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
        expect(de.properties.href).toEqual('/journals/1234567890abcdef');
        expect(de.nativeElement.innerText).toEqual('work journal');
    });
});
