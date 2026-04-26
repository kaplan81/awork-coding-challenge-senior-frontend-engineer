import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';

describe('User', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('can be instantiated via DI', inject([UserService], (injectedService: UserService) => {
    expect(injectedService).toEqual(service);
  }));
});
