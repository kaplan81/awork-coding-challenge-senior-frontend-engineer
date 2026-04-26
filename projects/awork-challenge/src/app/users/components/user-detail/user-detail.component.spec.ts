import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { User } from '../../models/user.model';
import { UserDetailComponent } from './user-detail.component';

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

describe('UserDetailComponent', () => {
  let fixture: ComponentFixture<UserDetailComponent>;
  let component: UserDetailComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UserDetailComponent);
    fixture.componentRef.setInput('user', buildUserMock());
    component = fixture.componentInstance;
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect(component).toMatchSnapshot();
  });

  it('should expose an aria-label derived from the user name', () => {
    expect(component.getAriaLabel()).toBe('Details for Anna Adams');
  });
});
