import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { GroupingRequest } from '../../models/grouping-request.model';
import { GroupingResponse } from '../../models/grouping-response.model';
import { UserGroup } from '../../models/user-group.model';
import { User } from '../../models/user.model';
import {
  USER_GROUPING_WORKER_FACTORY,
  UserGroupingService,
} from './user-grouping.service';

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

class FakeWorker {
  postMessage = vi.fn<(msg: GroupingRequest) => void>();
  terminate = vi.fn();
  #listeners: Array<(event: MessageEvent<GroupingResponse>) => void> = [];
  addEventListener(_type: 'message', listener: EventListener): void {
    this.#listeners.push(listener as unknown as (event: MessageEvent<GroupingResponse>) => void);
  }
  emit(response: GroupingResponse): void {
    const event = { data: response } as MessageEvent<GroupingResponse>;
    this.#listeners.forEach((l) => l(event));
  }
}

describe('UserGroupingService', () => {
  describe('with no worker available', () => {
    it('should fall back to the synchronous util', async () => {
      TestBed.configureTestingModule({
        providers: [
          { provide: USER_GROUPING_WORKER_FACTORY, useValue: () => null },
        ],
      });
      const service = TestBed.inject(UserGroupingService);
      const users: User[] = [
        buildUserMock({ id: '1', nat: 'US', lastname: 'Smith' }),
        buildUserMock({ id: '2', nat: 'DE', lastname: 'Müller' }),
      ];
      const groups: UserGroup[] = await service.group(users, 'nationality');
      expect(groups.map((g) => g.key)).toEqual(['DE', 'US']);
    });
  });

  describe('with a worker', () => {
    it('should post a message and resolve with the matching response', async () => {
      const worker = new FakeWorker();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: USER_GROUPING_WORKER_FACTORY,
            useValue: () => worker as unknown as Worker,
          },
        ],
      });
      const service = TestBed.inject(UserGroupingService);

      const promise = service.group([buildUserMock({ id: '1' })], 'nationality');
      expect(worker.postMessage).toHaveBeenCalledTimes(1);
      const sent: GroupingRequest = worker.postMessage.mock.calls[0][0];
      expect(sent.criterion).toBe('nationality');
      expect(sent.requestId).toBe(0);

      const expectedGroups: UserGroup[] = [
        { key: 'US', label: 'US', count: 1, users: [buildUserMock({ id: '1' })] },
      ];
      worker.emit({ requestId: sent.requestId, groups: expectedGroups });

      await expect(promise).resolves.toEqual(expectedGroups);
    });

    it('should ignore responses with unknown requestIds', async () => {
      const worker = new FakeWorker();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: USER_GROUPING_WORKER_FACTORY,
            useValue: () => worker as unknown as Worker,
          },
        ],
      });
      const service = TestBed.inject(UserGroupingService);

      const promise = service.group([buildUserMock({ id: '1' })], 'gender');
      const sent: GroupingRequest = worker.postMessage.mock.calls[0][0];
      worker.emit({ requestId: 9999, groups: [] });
      worker.emit({ requestId: sent.requestId, groups: [] });

      await expect(promise).resolves.toEqual([]);
    });

    it('should increment requestIds across calls', async () => {
      const worker = new FakeWorker();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: USER_GROUPING_WORKER_FACTORY,
            useValue: () => worker as unknown as Worker,
          },
        ],
      });
      const service = TestBed.inject(UserGroupingService);

      service.group([], 'nationality');
      service.group([], 'gender');

      expect(worker.postMessage.mock.calls[0][0].requestId).toBe(0);
      expect(worker.postMessage.mock.calls[1][0].requestId).toBe(1);
    });
  });
});
