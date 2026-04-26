import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
  allUsers = input.required<User[]>();
  user = input.required<User>();

  get nationalitiesCount(): number {
    if (!this.allUsers().length) {
      return 0;
    }

    return this.allUsers().reduce((acc, user) => {
      return user.nat === this.user().nat ? acc + 1 : acc;
    }, 0);
  }
}
