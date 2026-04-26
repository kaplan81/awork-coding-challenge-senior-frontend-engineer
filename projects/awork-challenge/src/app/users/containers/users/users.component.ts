import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserComponent } from '../../components/user/user.component';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user/user.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserComponent],
  selector: 'awk-users',
  standalone: true,
  styleUrls: ['./users.component.scss'],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  #destroyRef = inject(DestroyRef);
  #userService = inject(UserService);
  users: WritableSignal<User[]> = signal<User[]>([]);

  constructor() {
    this.#userService
      .getUsers()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((users: User[]) => this.users.set(users));
  }
}
