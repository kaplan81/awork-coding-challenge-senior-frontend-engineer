import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  // Remove component, debugEl or nativeEl let variables if not needed.
  let component: UsersComponent;
  let debugEl: DebugElement;
  let nativeEl: Element | HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    debugEl = fixture.debugElement;
    nativeEl = debugEl.nativeElement;
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect(component).toMatchSnapshot();
  });

  describe('firstComponentPublicMethod()', () => {
    it('should...', () => {
      expect(true).toBe(true);
    });
  });
});
