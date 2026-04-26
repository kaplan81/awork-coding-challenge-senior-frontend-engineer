import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserGroupComponent } from '../../components/user-group/user-group.component';
import { UsersToolbarComponent } from '../../components/users-toolbar/users-toolbar.component';
import { GroupingCriterionET } from '../../enums/grouping-criterion.enum';
import { ExpandedUserState } from '../../models/expanded-user-state.model';
import { UserGroup } from '../../models/user-group.model';
import { User } from '../../models/user.model';
import { UserGroupingService } from '../../services/user-grouping/user-grouping.service';
import { UserService } from '../../services/user/user.service';
import { filterUsers } from '../../utils/filter-users/filter-users.util';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserGroupComponent, UsersToolbarComponent],
  selector: 'awk-users',
  standalone: true,
  styleUrls: ['./users.component.scss'],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  #destroyRef = inject(DestroyRef);
  #userService = inject(UserService);
  #userGroupingService = inject(UserGroupingService);

  users: WritableSignal<User[]> = signal<User[]>([]);
  isLoading: WritableSignal<boolean> = signal<boolean>(true);
  error: WritableSignal<HttpErrorResponse | null> =
    signal<HttpErrorResponse | null>(null);
  searchTerm: WritableSignal<string> = signal<string>('');
  criterion: WritableSignal<GroupingCriterionET> =
    signal<GroupingCriterionET>('nationality');
  groups: WritableSignal<UserGroup[]> = signal<UserGroup[]>([]);
  isGrouping: WritableSignal<boolean> = signal<boolean>(false);
  openGroupKeys: WritableSignal<Set<string>> = signal<Set<string>>(new Set());
  expandedUser: WritableSignal<ExpandedUserState | null> =
    signal<ExpandedUserState | null>(null);

  filteredUsers: Signal<User[]> = computed(() =>
    filterUsers(this.users(), this.searchTerm()),
  );

  hasUsers: Signal<boolean> = computed(() => this.users().length > 0);

  constructor() {
    this.#userService
      .getUsers()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (users: User[]) => {
          this.users.set(users);
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err);
          this.isLoading.set(false);
        },
      });

    effect(() => {
      const users: User[] = this.filteredUsers();
      const criterion: GroupingCriterionET = this.criterion();
      this.isGrouping.set(true);
      this.#userGroupingService
        .group(users, criterion)
        .then((groups: UserGroup[]) => {
          this.groups.set(groups);
          this.isGrouping.set(false);
          this.#openTopGroupsByDefault(groups);
        })
        .catch(() => {
          this.groups.set([]);
          this.isGrouping.set(false);
        });
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onToggleGroup(key: string): void {
    this.openGroupKeys.update((current: Set<string>) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  onToggleUser(group: UserGroup, user: User): void {
    this.expandedUser.update((current: ExpandedUserState | null) => {
      if (
        current !== null &&
        current.groupKey === group.key &&
        current.userId === user.id
      ) {
        return null;
      }
      return { groupKey: group.key, userId: user.id };
    });
  }

  isGroupOpen(key: string): boolean {
    return this.openGroupKeys().has(key);
  }

  expandedUserIdFor(groupKey: string): string | null {
    const expanded: ExpandedUserState | null = this.expandedUser();
    return expanded !== null && expanded.groupKey === groupKey
      ? expanded.userId
      : null;
  }

  trackByGroupKey(_index: number, group: UserGroup): string {
    return group.key;
  }

  #openTopGroupsByDefault(groups: UserGroup[]): void {
    if (this.openGroupKeys().size > 0 || groups.length === 0) {
      return;
    }
    const defaults: Set<string> = new Set(
      groups.slice(0, Math.min(3, groups.length)).map((g: UserGroup) => g.key),
    );
    this.openGroupKeys.set(defaults);
  }
}
