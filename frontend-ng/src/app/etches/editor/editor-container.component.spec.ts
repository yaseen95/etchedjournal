import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ClockService } from '../../services/clock.service';
import { FakeClock } from '../../services/clock.service.spec';
import { EntryStore } from '../../stores/entry.store';
import { FakeEntryStore } from '../../stores/entry.store.spec';
import { EtchStore } from '../../stores/etch.store';
import { FakeEtchStore } from '../../stores/etch.store.spec';
import { EditorContainerComponent } from './editor-container.component';
import { EntryEditorComponent } from './entry-editor/entry-editor.component';
import { EntryTitleComponent } from './entry-title/entry-title.component';
import { EtchItemComponent } from './etch-item/etch-item.component';

describe('EditorContainerComponent', () => {
    let component: EditorContainerComponent;
    let fixture: ComponentFixture<EditorContainerComponent>;
    let store: EntryStore;
    let clockService: ClockService;

    beforeEach(async(() => {
        store = new FakeEntryStore();
        clockService = new FakeClock(1);

        TestBed.configureTestingModule({
            declarations: [
                EditorContainerComponent,
                EntryTitleComponent,
                EntryEditorComponent,
                EtchItemComponent,
            ],
            providers: [
                {provide: EntryStore, useValue: store},
                {provide: ClockService, useValue: clockService},
                {provide: EtchStore, useValue: new FakeEtchStore()}
            ],
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('generates title on init', () => {
        expect(component.title).toEqual(new Date(1).toLocaleDateString());
    });

    // TODO: Add some tests here
});
