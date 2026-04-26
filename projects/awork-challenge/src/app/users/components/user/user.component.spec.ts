import { ComponentFixture, TestBed } from '@angular/core/testing';

import { User } from '../../models/user.model';
import { UserComponent } from './user.component';

const mockLogin: User['login'] = {
  md5: '',
  password: '',
  salt: '',
  sha1: '',
  sha256: '',
  uuid: '',
  username: '',
};

const mockedUsers: User[] = [
  {
    email: 'a@example.com',
    firstname: 'Ann',
    image: 'https://example.com/a.jpg',
    lastname: 'One',
    login: mockLogin,
    nat: 'US',
    phone: '1',
  },
  {
    email: 'b@example.com',
    firstname: 'Bob',
    image: 'https://example.com/b.jpg',
    lastname: 'Two',
    login: mockLogin,
    nat: 'US',
    phone: '2',
  },
  {
    email: 'c@example.com',
    firstname: 'Cara',
    image: 'https://example.com/c.jpg',
    lastname: 'Three',
    login: mockLogin,
    nat: 'DE',
    phone: '3',
  },
];

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let nativeEl: Element | HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    nativeEl = fixture.debugElement.nativeElement;
    fixture.componentRef.setInput('user', mockedUsers[0]);
    fixture.componentRef.setInput('allUsers', mockedUsers);
  });

  it('should match snapshot', () => {
    fixture.detectChanges();
    expect(nativeEl).toMatchSnapshot();
  });

  describe('nationalitiesCount', () => {
    it('should return the count of users with the same nationality', () => {
      fixture.detectChanges();
      expect(component.nationalitiesCount).toEqual(2);
    });
  });
});
