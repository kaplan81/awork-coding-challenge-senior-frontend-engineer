import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { UserApi } from '../../models/user-api.model';
import { UserDto } from '../../models/user-dto.model';
import { User } from '../../models/user.model';
import { UserService } from './user.service';

const buildUserDtoMock = (override: Partial<UserDto> = {}): UserDto => ({
  gender: 'female',
  name: { title: 'Miss', first: 'Jennie', last: 'Nichols' },
  location: {
    street: { number: 8929, name: 'Valwood Pkwy' },
    city: 'Billings',
    state: 'Michigan',
    country: 'United States',
    postcode: '63104',
    coordinates: { latitude: '-69.8246', longitude: '134.8719' },
    timezone: { offset: '+9:30', description: 'Adelaide, Darwin' },
  },
  email: 'jennie.nichols@example.com',
  login: {
    uuid: '7a0eed16-9430-4d68-901f-c0d4c1c3bf00',
    username: 'yellowpeacock117',
    password: 'addison',
    salt: 'sld1yGtd',
    md5: 'ab54ac4c0be9480ae8fa5e9e2a5196a3',
    sha1: 'edcf2ce613cbdea349133c52dc2f3b83168dc51b',
    sha256: '48df5229235ada28389b91e60a935e4f9b73eb4bdb855ef9258a1751f10bdc5d',
  },
  dob: { date: '1992-03-08T15:13:16.688Z', age: 30 },
  registered: { date: '2007-07-09T05:51:59.390Z', age: 14 },
  phone: '(272) 790-0888',
  cell: '(489) 330-2385',
  id: { name: 'SSN', value: '405-88-3636' },
  picture: {
    large: 'https://randomuser.me/api/portraits/men/75.jpg',
    medium: 'https://randomuser.me/api/portraits/med/men/75.jpg',
    thumbnail: 'https://randomuser.me/api/portraits/thumb/men/75.jpg',
  },
  nat: 'US',
  ...override,
});

const buildUserApiResponseMock = (results: UserDto[]): UserApi => ({
  results,
  info: { seed: 'awork', results: results.length, page: 1 },
});

const expectedUrlMock: string = `${UserService.apiUrl}?results=5000&seed=awork&page=1`;

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('can be instantiated via DI', inject(
    [UserService],
    (injectedService: UserService) => {
      expect(injectedService).toEqual(service);
    },
  ));

  describe('getUsers()', () => {
    it('should make a GET request to the expected URL with default page', () => {
      service.getUsers().subscribe();
      const req = httpTestingController.expectOne(expectedUrlMock);
      expect(req.request.method).toBe('GET');
      req.flush(buildUserApiResponseMock([buildUserDtoMock()]));
    });

    it('should map the DTO into the User domain model', () =>
      new Promise<void>((done: () => void) => {
        const userDtoMock: UserDto = buildUserDtoMock();
        service.getUsers().subscribe((users: User[]) => {
          expect(users).toHaveLength(1);
          const user: User = users[0];
          expect(user).toEqual({
            id: userDtoMock.login.uuid,
            firstname: 'Jennie',
            lastname: 'Nichols',
            email: 'jennie.nichols@example.com',
            phone: '(272) 790-0888',
            cell: '(489) 330-2385',
            username: 'yellowpeacock117',
            image: `${userDtoMock.picture.medium}?id=${userDtoMock.login.uuid}`,
            imageLarge: `${userDtoMock.picture.large}?id=${userDtoMock.login.uuid}`,
            nat: 'US',
            gender: 'female',
            age: 30,
            dob: '1992-03-08T15:13:16.688Z',
            country: 'United States',
            city: 'Billings',
            state: 'Michigan',
            login: userDtoMock.login,
          });
          done();
        });
        const req = httpTestingController.expectOne(expectedUrlMock);
        req.flush(buildUserApiResponseMock([userDtoMock]));
      }));

    it('should multicast and not re-issue the request for the same page', () => {
      service.getUsers().subscribe();
      service.getUsers().subscribe();
      const req = httpTestingController.expectOne(expectedUrlMock);
      req.flush(buildUserApiResponseMock([buildUserDtoMock()]));
    });

    it('should issue a different request for a different page', () => {
      service.getUsers(1).subscribe();
      service.getUsers(2).subscribe();
      const reqs = httpTestingController.match((request) =>
        request.url.startsWith(UserService.apiUrl),
      );
      expect(reqs).toHaveLength(2);
      reqs.forEach((req) => {
        req.flush(buildUserApiResponseMock([buildUserDtoMock()]));
      });
    });

    it('should propagate backend errors to subscribers', () =>
      new Promise<void>((done: () => void, fail: (err: unknown) => void) => {
        service.getUsers().subscribe({
          next: () => fail(new Error('Expected backend error')),
          error: (error) => {
            expect(error.status).toBe(500);
            done();
          },
        });
        const req = httpTestingController.expectOne(expectedUrlMock);
        req.flush('boom', { status: 500, statusText: 'Server Error' });
      }));
  });
});
