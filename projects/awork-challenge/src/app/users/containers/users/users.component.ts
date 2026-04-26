import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user/user.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'awk-users',
  standalone: true,
  styleUrls: ['./users.component.scss'],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  #userService = inject(UserService);
  users: WritableSignal<User[]> = signal<User[]>([]);

  constructor() {
    this.#userService.getUsers().subscribe((users: User[]) => this.users.set(users));
  }
  // // Remove this prop if this component contains no RxJS subscriptions.
  // #destroyRef = inject(DestroyRef);
  // // Remove this prop if this component contains no loading interface (e.g. spinner or progress).
  // isLoading: WritableSignal<boolean> = signal<boolean>(true);
}
