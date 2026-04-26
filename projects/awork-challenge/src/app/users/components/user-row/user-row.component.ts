import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  input,
  output,
} from '@angular/core';

import { User } from '../../models/user.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  selector: 'awk-user-row',
  standalone: true,
  styleUrls: ['./user-row.component.scss'],
  templateUrl: './user-row.component.html',
  host: {
    class: 'awk-user-row',
    role: 'row',
    '[class.awk-user-row--expanded]': 'expanded()',
    '[attr.aria-expanded]': 'expanded()',
    '(click)': 'toggle.emit(user())',
    '(keydown.enter)': 'toggle.emit(user())',
    '(keydown.space)': 'toggle.emit(user())',
    tabindex: '0',
  },
})
export class UserRowComponent {
  user: InputSignal<User> = input.required<User>();
  expanded: InputSignal<boolean> = input<boolean>(false);
  toggle: OutputEmitterRef<User> = output<User>();
}
