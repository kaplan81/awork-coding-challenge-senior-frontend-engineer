import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { User } from '../../models/user.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'awk-user',
  standalone: true,
  styleUrls: ['./user.component.scss'],
  templateUrl: './user.component.html',
})
export class UserComponent {
  allUsers: InputSignal<User[]> = input.required<User[]>();
  user: InputSignal<User> = input.required<User>();

  get nationalitiesCount(): number {
    if (this.allUsers().length === 0) {
      return 0;
    }

    return this.allUsers().reduce((acc: number, user: User) => {
      return user.nat === this.user().nat ? acc + 1 : acc;
    }, 0);
  }
}
