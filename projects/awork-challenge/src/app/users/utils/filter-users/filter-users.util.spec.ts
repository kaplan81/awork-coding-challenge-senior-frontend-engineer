import { describe, expect, it } from 'vitest';

import { User } from '../../models/user.model';
import { filterUsers } from './filter-users.util';

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
    uuid: 'uuid-default',
    username: 'user',
    password: 'pwd',
    salt: 'salt',
    md5: 'md5',
    sha1: 'sha1',
    sha256: 'sha256',
  },
  ...override,
});

describe('filterUsers()', () => {
  const usersMock: User[] = [
    buildUserMock({
      id: '1',
      firstname: 'Alice',
      lastname: 'Adams',
      email: 'alice@a.com',
      username: 'al-a',
      nat: 'US',
      country: 'United States',
    }),
    buildUserMock({
      id: '2',
      firstname: 'Bob',
      lastname: 'Brown',
      email: 'bob@b.com',
      username: 'bb-b',
      nat: 'DE',
      country: 'Germany',
    }),
    buildUserMock({
      id: '3',
      firstname: 'Carl',
      lastname: 'Carter',
      email: 'carl@c.com',
      username: 'cc-c',
      nat: 'FR',
      country: 'France',
    }),
  ];

  it('should return the same reference when the term is empty', () => {
    expect(filterUsers(usersMock, '')).toBe(usersMock);
    expect(filterUsers(usersMock, '   ')).toBe(usersMock);
  });

  it('should match firstname case-insensitively', () => {
    const result: User[] = filterUsers(usersMock, 'aLiCe');
    expect(result.map((u) => u.id)).toEqual(['1']);
  });

  it('should match lastname', () => {
    expect(filterUsers(usersMock, 'brown').map((u) => u.id)).toEqual(['2']);
  });

  it('should match email substring', () => {
    expect(filterUsers(usersMock, '@b.com').map((u) => u.id)).toEqual(['2']);
  });

  it('should match username', () => {
    expect(filterUsers(usersMock, 'cc-c').map((u) => u.id)).toEqual(['3']);
  });

  it('should match nat code', () => {
    expect(filterUsers(usersMock, 'de').map((u) => u.id)).toEqual(['2']);
  });

  it('should match country', () => {
    expect(filterUsers(usersMock, 'germany').map((u) => u.id)).toEqual(['2']);
  });

  it('should return an empty array when nothing matches', () => {
    expect(filterUsers(usersMock, 'xxxxxxx')).toEqual([]);
  });
});
