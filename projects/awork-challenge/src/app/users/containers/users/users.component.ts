import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'awk-users',
  standalone: true,
  styleUrls: ['./users.component.scss'],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  // Remove this prop if this component contains no RxJS subscriptions.
  #destroyRef = inject(DestroyRef);
  // Remove this prop if this component contains no loading interface (e.g. spinner or progress).
  isLoading: WritableSignal<boolean> = signal<boolean>(true);
}
