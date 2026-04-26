import { DatePipe, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  input,
} from '@angular/core';

import { User } from '../../models/user.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgOptimizedImage, TitleCasePipe],
  selector: 'awk-user-detail',
  standalone: true,
  styleUrls: ['./user-detail.component.scss'],
  templateUrl: './user-detail.component.html',
  host: {
    class: 'awk-user-detail',
    role: 'region',
    '[attr.aria-label]': 'getAriaLabel()',
  },
})
export class UserDetailComponent {
  user: InputSignal<User> = input.required<User>();

  getAriaLabel(): string {
    const u: User = this.user();
    return `Details for ${u.firstname} ${u.lastname}`;
  }
}
