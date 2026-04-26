import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersToolbarComponent } from './users-toolbar.component';

describe('UsersToolbarComponent', () => {
  let fixture: ComponentFixture<UsersToolbarComponent>;
  let component: UsersToolbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersToolbarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UsersToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect({
      componentName: component.constructor.name,
      totalCount: component.totalCount(),
      matchCount: component.matchCount(),
      criterion: component.criterion(),
      searchValue: component.searchControl.value,
    }).toMatchSnapshot();
  });

  it('should emit a debounced searchChange when the input value changes', () => {
    vi.useFakeTimers();
    const emitted: string[] = [];
    component.searchChange.subscribe((value: string) => emitted.push(value));

    component.searchControl.setValue('hello');
    vi.advanceTimersByTime(149);
    expect(emitted).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(emitted).toEqual(['hello']);
  });

  it('should de-duplicate identical successive emissions', () => {
    vi.useFakeTimers();
    const emitted: string[] = [];
    component.searchChange.subscribe((value: string) => emitted.push(value));

    component.searchControl.setValue('a');
    vi.advanceTimersByTime(150);
    component.searchControl.setValue('a');
    vi.advanceTimersByTime(150);
    expect(emitted).toEqual(['a']);
  });
});
