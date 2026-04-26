import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  InputSignal,
  OutputEmitterRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { GroupingCriterionET } from '../../enums/grouping-criterion.enum';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  selector: 'awk-users-toolbar',
  standalone: true,
  styleUrls: ['./users-toolbar.component.scss'],
  templateUrl: './users-toolbar.component.html',
  host: {
    class: 'awk-users-toolbar',
  },
})
export class UsersToolbarComponent {
  static readonly searchDebounceMs = 150;

  #destroyRef = inject(DestroyRef);

  totalCount: InputSignal<number> = input<number>(0);
  matchCount: InputSignal<number> = input<number>(0);
  criterion: InputSignal<GroupingCriterionET> = input<GroupingCriterionET>('nationality');

  searchChange: OutputEmitterRef<string> = output<string>();

  searchControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(UsersToolbarComponent.searchDebounceMs),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((value: string) => this.searchChange.emit(value));
  }
}
