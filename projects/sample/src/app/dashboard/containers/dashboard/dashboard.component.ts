import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'smp-dashboard',
  standalone: true,
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  // Remove this prop if this component contains no RxJS subscriptions.
  #destroyRef = inject(DestroyRef);
  // Remove this prop if this component contains no loading interface (e.g. spinner or progress).
  isLoading: WritableSignal<boolean> = signal<boolean>(true);
}
