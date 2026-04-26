import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { User } from '../../models/user.model';
import { UserRowComponent } from './user-row.component';

const buildUserMock = (override: Partial<User> = {}): User => ({
  id: 'uuid-1',
  firstname: 'Anna',
  lastname: 'Adams',
  email: 'anna@a.com',
  phone: '111',
  cell: '222',
  username: 'anna-a',
  image: 'https://example.com/medium.jpg',
  imageLarge: 'https://example.com/large.jpg',
  nat: 'US',
  gender: 'female',
  age: 30,
  dob: '1995-01-01',
  country: 'United States',
  city: 'Springfield',
  state: 'IL',
  login: {
    uuid: 'uuid-1',
    username: 'anna-a',
    password: 'pwd',
    salt: 'salt',
    md5: 'md5',
    sha1: 'sha1',
    sha256: 'sha256',
  },
  ...override,
});

describe('UserRowComponent', () => {
  let fixture: ComponentFixture<UserRowComponent>;
  let component: UserRowComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRowComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UserRowComponent);
    fixture.componentRef.setInput('user', buildUserMock());
    component = fixture.componentInstance;
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect({
      componentName: component.constructor.name,
      user: component.user(),
      expanded: component.expanded(),
    }).toMatchSnapshot();
  });

  it('should emit toggle when host is clicked', () => {
    let emitted: User | null = null;
    component.toggle.subscribe((user: User) => {
      emitted = user;
    });
    fixture.detectChanges();
    fixture.nativeElement.click();
    expect(emitted).not.toBeNull();
    expect(emitted!.id).toBe('uuid-1');
  });

  it('should reflect expanded state via aria-expanded', () => {
    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-expanded')).toBe('true');
  });
});
