import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserGroup } from '../../models/user-group.model';
import { User } from '../../models/user.model';
import { UserGroupComponent } from './user-group.component';

const buildUserMock = (override: Partial<User> = {}): User => ({
  id: override.id ?? 'uuid-1',
  firstname: 'First',
  lastname: 'Last',
  email: 'a@b.c',
  phone: '111',
  cell: '222',
  username: 'user',
  image: 'img-medium',
  imageLarge: 'img-large',
  nat: 'US',
  gender: 'female',
  age: 30,
  dob: '1995-01-01',
  country: 'United States',
  city: 'Springfield',
  state: 'IL',
  login: {
    uuid: override.id ?? 'uuid-1',
    username: 'user',
    password: 'pwd',
    salt: 'salt',
    md5: 'md5',
    sha1: 'sha1',
    sha256: 'sha256',
  },
  ...override,
});

const buildGroupMock = (users: User[]): UserGroup => ({
  key: 'US',
  label: 'US',
  count: users.length,
  users,
});

describe('UserGroupComponent', () => {
  let fixture: ComponentFixture<UserGroupComponent>;
  let component: UserGroupComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGroupComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UserGroupComponent);
    fixture.componentRef.setInput(
      'group',
      buildGroupMock([
        buildUserMock({ id: '1' }),
        buildUserMock({ id: '2' }),
        buildUserMock({ id: '3' }),
      ]),
    );
    component = fixture.componentInstance;
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect({
      componentName: component.constructor.name,
      group: component.group(),
      open: component.open(),
      expandedUserId: component.expandedUserId(),
    }).toMatchSnapshot();
  });

  it('should resolve expandedIndex by user id', () => {
    fixture.componentRef.setInput('expandedUserId', '2');
    expect(component.expandedIndex()).toBe(1);
  });

  it('should return null index for an unknown user id', () => {
    fixture.componentRef.setInput('expandedUserId', 'does-not-exist');
    expect(component.expandedIndex()).toBeNull();
  });

  it('should emit toggleOpen with the group key', () => {
    let emitted: string | null = null;
    component.toggleOpen.subscribe((key: string) => {
      emitted = key;
    });
    component.onToggleOpen();
    expect(emitted).toBe('US');
  });
});
