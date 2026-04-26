import { DestroyRef, InjectionToken, Injectable, inject } from '@angular/core';

import { GroupingCriterionET } from '../../enums/grouping-criterion.enum';
import { GroupingRequest } from '../../models/grouping-request.model';
import { GroupingResponse } from '../../models/grouping-response.model';
import { PendingGroupingRequest } from '../../models/pending-grouping-request.model';
import { UserGroup } from '../../models/user-group.model';
import { User } from '../../models/user.model';
import { groupUsers } from '../../utils/group-users/group-users.util';

/**
 * Worker factory injection token. In production it constructs the bundled
 * `user-grouping.worker.ts`. Tests provide a `useValue` factory returning
 * `null`, which forces the synchronous fallback path.
 */
export const USER_GROUPING_WORKER_FACTORY = new InjectionToken<() => Worker | null>(
  'USER_GROUPING_WORKER_FACTORY',
  {
    providedIn: 'root',
    factory: (): (() => Worker | null) => () => createWorker(),
  },
);

function createWorker(): Worker | null {
  if (typeof Worker === 'undefined') {
    return null;
  }
  try {
    return new Worker(new URL('./user-grouping.worker', import.meta.url), {
      type: 'module',
    });
  } catch {
    return null;
  }
}

/**
 * Wraps a single shared Web Worker that off-loads `groupUsers()` from the
 * main thread. When the injected factory returns `null` (tests / SSR / older
 * browsers) it transparently falls back to the synchronous pure util.
 */
@Injectable({
  providedIn: 'root',
})
export class UserGroupingService {
  #destroyRef = inject(DestroyRef);
  #worker: Worker | null = inject(USER_GROUPING_WORKER_FACTORY)();
  #pending = new Map<number, PendingGroupingRequest>();
  #nextRequestId: number = 0;

  constructor() {
    this.#worker?.addEventListener(
      'message',
      this.#handleMessage as EventListener,
    );
    this.#destroyRef.onDestroy(() => this.#worker?.terminate());
  }

  group(users: User[], criterion: GroupingCriterionET): Promise<UserGroup[]> {
    if (this.#worker === null) {
      return Promise.resolve(groupUsers(users, criterion));
    }
    const requestId: number = this.#nextRequestId++;
    const message: GroupingRequest = { requestId, users, criterion };
    return new Promise<UserGroup[]>((resolve, reject) => {
      this.#pending.set(requestId, { resolve, reject });
      try {
        this.#worker?.postMessage(message);
      } catch (error: unknown) {
        this.#pending.delete(requestId);
        reject(error);
      }
    });
  }

  #handleMessage = (event: MessageEvent<GroupingResponse>): void => {
    const { requestId, groups } = event.data;
    const pending: PendingGroupingRequest | undefined = this.#pending.get(requestId);
    if (pending === undefined) {
      return;
    }
    this.#pending.delete(requestId);
    pending.resolve(groups);
  };
}
