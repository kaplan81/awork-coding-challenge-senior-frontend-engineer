import { describe, expect, it } from 'vitest';

import { User } from '../../models/user.model';
import { groupUsers } from './group-users.util';

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

describe('groupUsers()', () => {
  it('should return an empty array for empty input', () => {
    expect(groupUsers([], 'alphabetical')).toEqual([]);
  });

  describe('alphabetical', () => {
    it('should group by uppercase first letter of lastname', () => {
      const users: User[] = [
        buildUserMock({ id: '1', lastname: 'adams', firstname: 'Anna' }),
        buildUserMock({ id: '2', lastname: 'Brown', firstname: 'Bob' }),
        buildUserMock({ id: '3', lastname: 'archer', firstname: 'Amy' }),
      ];
      const result = groupUsers(users, 'alphabetical');
      expect(result.map((g) => g.key)).toEqual(['A', 'B']);
      expect(result[0].count).toBe(2);
      expect(result[0].users.map((u) => u.firstname)).toEqual(['Anna', 'Amy']);
    });

    it('should bucket non-letter starts under "#"', () => {
      const users: User[] = [
        buildUserMock({ id: '1', lastname: '7-eleven' }),
        buildUserMock({ id: '2', lastname: '' }),
        buildUserMock({ id: '3', lastname: 'Smith' }),
      ];
      const result = groupUsers(users, 'alphabetical');
      expect(result.map((g) => g.key)).toEqual(['#', 'S']);
      expect(result[0].count).toBe(2);
    });
  });

  describe('age', () => {
    it.each([
      [17, '00-under-18'],
      [18, '01-18-24'],
      [24, '01-18-24'],
      [25, '02-25-34'],
      [44, '03-35-44'],
      [54, '04-45-54'],
      [64, '05-55-64'],
      [65, '06-65-plus'],
      [99, '06-65-plus'],
    ])('should put age %s in bucket %s', (age, key) => {
      const result = groupUsers([buildUserMock({ age })], 'age');
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe(key);
    });

    it('should sort buckets in ascending age order', () => {
      const users: User[] = [
        buildUserMock({ id: '1', age: 70 }),
        buildUserMock({ id: '2', age: 22 }),
        buildUserMock({ id: '3', age: 40 }),
      ];
      const result = groupUsers(users, 'age');
      expect(result.map((g) => g.key)).toEqual(['01-18-24', '03-35-44', '06-65-plus']);
    });
  });

  describe('nationality', () => {
    it('should group by nat code', () => {
      const users: User[] = [
        buildUserMock({ id: '1', nat: 'US' }),
        buildUserMock({ id: '2', nat: 'DE' }),
        buildUserMock({ id: '3', nat: 'US' }),
      ];
      const result = groupUsers(users, 'nationality');
      expect(result.map((g) => g.key)).toEqual(['DE', 'US']);
      expect(result.find((g) => g.key === 'US')?.count).toBe(2);
    });
  });

  describe('gender', () => {
    it('should normalise to lowercase keys', () => {
      const users: User[] = [
        buildUserMock({ id: '1', gender: 'Female' }),
        buildUserMock({ id: '2', gender: 'male' }),
        buildUserMock({ id: '3', gender: 'female' }),
      ];
      const result = groupUsers(users, 'gender');
      expect(result.map((g) => g.key)).toEqual(['female', 'male']);
    });

    it('should map unknown gender to "Other"', () => {
      const users: User[] = [
        buildUserMock({ id: '1', gender: 'non-binary' }),
        buildUserMock({ id: '2', gender: 'unspecified' }),
      ];
      const result = groupUsers(users, 'gender');
      expect(result.every((g) => g.label === 'Other')).toBe(true);
    });
  });

  describe('within-group sort', () => {
    it('should sort users by lastname then firstname', () => {
      const users: User[] = [
        buildUserMock({ id: '1', lastname: 'Smith', firstname: 'Bob', nat: 'US' }),
        buildUserMock({ id: '2', lastname: 'Smith', firstname: 'Anna', nat: 'US' }),
        buildUserMock({ id: '3', lastname: 'Allen', firstname: 'Zach', nat: 'US' }),
      ];
      const result = groupUsers(users, 'nationality');
      expect(result[0].users.map((u) => `${u.lastname},${u.firstname}`)).toEqual([
        'Allen,Zach',
        'Smith,Anna',
        'Smith,Bob',
      ]);
    });
  });
});
