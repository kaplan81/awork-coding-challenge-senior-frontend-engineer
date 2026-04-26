import { ScrollingModule, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  Signal,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

import { ExpandableVirtualScrollStrategyConfig } from '../../models/expandable-virtual-scroll-strategy-config.model';
import { UserGroup } from '../../models/user-group.model';
import { User } from '../../models/user.model';
import {
  EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG,
  ExpandableVirtualScrollStrategyService,
} from '../../services/expandable-virtual-scroll-strategy/expandable-virtual-scroll-strategy.service';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserRowComponent } from '../user-row/user-row.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollingModule, UserRowComponent, UserDetailComponent],
  selector: 'awk-user-group',
  standalone: true,
  styleUrls: ['./user-group.component.scss'],
  templateUrl: './user-group.component.html',
  host: {
    class: 'awk-user-group',
    '[class.awk-user-group--open]': 'open()',
  },
  providers: [
    {
      provide: EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG,
      useValue: {
        collapsedItemSize: UserGroupComponent.collapsedRowPx,
        expandedItemSize: UserGroupComponent.expandedRowPx,
        minBufferPx: UserGroupComponent.minBufferPx,
        maxBufferPx: UserGroupComponent.maxBufferPx,
      } satisfies ExpandableVirtualScrollStrategyConfig,
    },
    ExpandableVirtualScrollStrategyService,
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useExisting: ExpandableVirtualScrollStrategyService,
    },
  ],
})
export class UserGroupComponent {
  static readonly collapsedRowPx = 56;
  static readonly expandedRowPx = UserGroupComponent.collapsedRowPx + 220;
  static readonly maxBufferPx = 400;
  static readonly minBufferPx = 200;
  static readonly viewportMaxHeight = 480;

  #strategy = inject(ExpandableVirtualScrollStrategyService);

  group: InputSignal<UserGroup> = input.required<UserGroup>();
  open: InputSignal<boolean> = input<boolean>(true);
  expandedUserId: InputSignal<string | null> = input<string | null>(null);

  toggleOpen: OutputEmitterRef<string> = output<string>();
  toggleUser: OutputEmitterRef<User> = output<User>();

  collapsedRowPx: number = UserGroupComponent.collapsedRowPx;

  expandedIndex: Signal<number | null> = computed(() => {
    const id: string | null = this.expandedUserId();
    if (id === null) {
      return null;
    }
    const idx: number = this.group().users.findIndex((u: User) => u.id === id);
    return idx === -1 ? null : idx;
  });

  viewportHeight: Signal<number> = computed(() => {
    const groupSize: number = this.group().count * UserGroupComponent.collapsedRowPx;
    const expandedExtra: number =
      this.expandedIndex() !== null
        ? UserGroupComponent.expandedRowPx - UserGroupComponent.collapsedRowPx
        : 0;
    return Math.min(groupSize + expandedExtra, UserGroupComponent.viewportMaxHeight);
  });

  constructor() {
    effect(() => {
      this.#strategy.setExpandedIndex(this.expandedIndex());
    });
  }

  trackById(_index: number, user: User): string {
    return user.id;
  }

  onToggleOpen(): void {
    this.toggleOpen.emit(this.group().key);
  }

  onToggleUser(user: User): void {
    this.toggleUser.emit(user);
  }
}
