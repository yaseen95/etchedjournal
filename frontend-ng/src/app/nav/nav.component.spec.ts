import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MobxAngularModule } from 'mobx-angular';
import { JournalV1 } from '../models/journal/journal-v1';
import { AuthService } from '../services/auth.service';
import { FakeJournalStore } from '../services/fakes.service.spec';
import { JournalEntity } from '../services/models/journal-entity';
import { JournalStore } from '../stores/journal.store';
import { TestUtils } from '../utils/test-utils.spec';
import { NavComponent } from './nav.component';
import createJournalEntity = TestUtils.createJournalEntity;
import TEST_USER = TestUtils.TEST_USER;

describe('NavComponent', () => {
    let component: NavComponent;
    let fixture: ComponentFixture<NavComponent>;
    let authSpy: any;
    let journalStore: JournalStore;

    const TEST_JOURNALS: JournalEntity[] = [
        createJournalEntity({ id: 'abc', content: '1' }),
        createJournalEntity({ id: 'def', content: '2' }),
        createJournalEntity({ id: 'ghi', content: '3' }),
        createJournalEntity({ id: 'jkl', content: '4' }),
    ];

    const JOURNALS_BY_ID: Map<string, JournalV1> = new Map<string, JournalV1>();
    JOURNALS_BY_ID.set('abc', new JournalV1({ name: 'journal abc', created: 1 }));
    JOURNALS_BY_ID.set('def', new JournalV1({ name: 'journal def', created: 1 }));
    JOURNALS_BY_ID.set('ghi', new JournalV1({ name: 'journal ghi', created: 1 }));
    JOURNALS_BY_ID.set('jkl', new JournalV1({ name: 'journal jkl', created: 1 }));

    beforeEach(async(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'logout']);
        journalStore = new FakeJournalStore();
        journalStore.entities = TEST_JOURNALS;
        journalStore.journalsById = JOURNALS_BY_ID;

        TestBed.configureTestingModule({
            declarations: [NavComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: JournalStore, useValue: journalStore },
            ],
            imports: [RouterTestingModule, MobxAngularModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('collapseDropdownOnMobile is true on init', () => {
        expect(component.collapseDropdownOnMobile).toBe(true);
    });

    it('burgerIsActive is false on init', () => {
        expect(component.burgerIsActive).toBe(false);
    });

    it('toggling burger menu active updates classes', () => {
        // Preconditions - not active when `burgerIsActive` is false.
        expect(component.burgerIsActive).toBeFalsy();
        const burgerMenuBtnDe = TestUtils.queryExpectOne(fixture.debugElement, 'a.navbar-burger');
        const navBarMenuDe = TestUtils.queryExpectOne(fixture.debugElement, 'div.navbar-menu');
        expect(burgerMenuBtnDe.classes['is-active']).toBeFalsy();
        expect(navBarMenuDe.classes['is-active']).toBeFalsy();

        component.toggleBurgerMenu();
        fixture.detectChanges();

        expect(burgerMenuBtnDe.classes['is-active']).toBeTruthy();
        expect(navBarMenuDe.classes['is-active']).toBeTruthy();
        expect(component.burgerIsActive).toBeTruthy();
    });

    it('displays register and login buttons when not logged in', () => {
        authSpy.getUser.and.returnValue(null);
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, '#register-btn');
        TestUtils.queryExpectOne(fixture.debugElement, '#login-btn');
        // does not display logout button
        TestUtils.queryExpectNone(fixture.debugElement, '#logout-btn');
    });

    it('displays logout button when logged in', () => {
        authSpy.getUser.and.returnValue(TEST_USER);
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, '#logout-btn');
        // does not display login and register buttons
        TestUtils.queryExpectNone(fixture.debugElement, '#register-btn');
        TestUtils.queryExpectNone(fixture.debugElement, '#login-btn');
    });

    it('displays links to journals', () => {
        journalStore.entities = TEST_JOURNALS.slice(0, 2);
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('.journal-nav-item'));
        expect(items.length).toEqual(2);
        expect(items[0].properties.href).toEqual('/journals/abc');
        expect(items[0].nativeElement.innerText.trim()).toEqual('journal abc');
        expect(items[1].properties.href).toEqual('/journals/def');
        expect(items[1].nativeElement.innerText.trim()).toEqual('journal def');
    });

    it('journals are not displayed in dropdown when 3 or less', () => {
        journalStore.entities = TEST_JOURNALS.slice(0, 3);
        fixture.detectChanges();
        TestUtils.queryExpectNone(fixture.debugElement, '.navbar-dropdown');
    });

    it('journals are displayed in dropdown when more than 3', () => {
        fixture.detectChanges();

        const dropdownDe = TestUtils.queryExpectOne(fixture.debugElement, '.navbar-dropdown');
        // query inside the dropdown element
        const journalItemDes = dropdownDe.queryAll(By.css('.journal-nav-item'));
        expect(journalItemDes.length).toBe(4);
    });

    it('collapseDropdownOnMobile collapses dropdown on mobile and tablet', () => {
        component.collapseDropdownOnMobile = true;

        fixture.detectChanges();

        const dropdownDe = TestUtils.queryExpectOne(fixture.debugElement, '.navbar-dropdown');
        expect(dropdownDe.classes['is-hidden-mobile']).toBe(true);
        expect(dropdownDe.classes['is-hidden-tablet-only']).toBe(true);
    });

    it('collapseDropdownOnMobile expands dropdown on mobile and tablet', () => {
        component.collapseDropdownOnMobile = false;

        fixture.detectChanges();

        const dropdownDe = TestUtils.queryExpectOne(fixture.debugElement, '.navbar-dropdown');
        // We just check that the hidden isn't applied
        expect(dropdownDe.classes['is-hidden-mobile']).toBe(false);
        expect(dropdownDe.classes['is-hidden-tablet-only']).toBe(false);
    });

    it('toggleDropdown changes collapseDropdownOnMobile', () => {
        component.collapseDropdownOnMobile = false;
        component.toggleJournalDropdown();
        expect(component.collapseDropdownOnMobile).toBe(true);

        component.collapseDropdownOnMobile = true;
        component.toggleJournalDropdown();
        expect(component.collapseDropdownOnMobile).toBe(false);
    });

    it('clicking navbar-item dropdown togglesDropdown', () => {
        component.collapseDropdownOnMobile = true;
        fixture.detectChanges();

        const dropdownItemDe = TestUtils.queryExpectOne(fixture.debugElement, '.has-dropdown');
        (dropdownItemDe.nativeElement as HTMLElement).click();
        expect(component.collapseDropdownOnMobile).toBe(false);
    });
});
