import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let debugEl: DebugElement;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    debugEl = fixture.debugElement;
    nativeEl = debugEl.nativeElement;
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect(component).toMatchSnapshot();
  });

  it('should render title', async () => {
    await fixture.whenStable();
    expect(nativeEl.querySelector('h1')?.textContent).toContain('Hello, sample');
  });
});
