import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserGroup } from '../../models/user-group.model';
import { User } from '../../models/user.model';
import { UserGroupingService } from '../../services/user-grouping/user-grouping.service';
import { UserService } from '../../services/user/user.service';
import { UsersComponent } from './users.component';

const buildUserMock = (override: Partial<User> = {}): User => ({
  id: override.id ?? 'uuid-default',
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
    uuid: override.id ?? 'uuid-default',
    username: 'user',
    password: 'pwd',
    salt: 'salt',
    md5: 'md5',
    sha1: 'sha1',
    sha256: 'sha256',
  },
  ...override,
});

const buildGroupingServiceStub = (): Partial<UserGroupingService> => ({
  group: vi.fn(
    (users: User[]): Promise<UserGroup[]> =>
      Promise.resolve([
        { key: 'US', label: 'US', count: users.length, users },
      ]),
  ),
});

const buildUserServiceStub = (
  users: User[] = [buildUserMock()],
): Partial<UserService> => ({
  getUsers: vi.fn((): Observable<User[]> => of(users)),
});

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: buildUserServiceStub() },
        { provide: UserGroupingService, useValue: buildGroupingServiceStub() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect(component).toMatchSnapshot();
  });

  it('should populate users from the service and stop loading', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.users().length).toBe(1);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should derive filteredUsers from searchTerm', () => {
    const users: User[] = [
      buildUserMock({ id: '1', firstname: 'Alice' }),
      buildUserMock({ id: '2', firstname: 'Bob' }),
    ];
    component.users.set(users);
    component.searchTerm.set('alice');
    expect(component.filteredUsers().map((u) => u.id)).toEqual(['1']);
  });

  it('should toggle a group key in openGroupKeys', () => {
    component.onToggleGroup('US');
    expect(component.isGroupOpen('US')).toBe(true);
    component.onToggleGroup('US');
    expect(component.isGroupOpen('US')).toBe(false);
  });

  it('should toggle expandedUser scoped to its group', () => {
    const group: UserGroup = {
      key: 'US',
      label: 'US',
      count: 1,
      users: [buildUserMock({ id: '1' })],
    };
    component.onToggleUser(group, group.users[0]);
    expect(component.expandedUserIdFor('US')).toBe('1');
    component.onToggleUser(group, group.users[0]);
    expect(component.expandedUserIdFor('US')).toBeNull();
  });
});
