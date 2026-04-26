import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-tailored-boilerplate',
  standalone: true,
  styleUrls: ['./tailored-boilerplate.component.scss'],
  templateUrl: './tailored-boilerplate.component.html',
})
export class TailoredBoilerplateComponent {
  /**
   * These 2 properties are boilerplate for container components.
   */
  // Remove this prop if this component contains no RxJS subscriptions.
  #destroyRef = inject(DestroyRef);
  // Remove this prop if this component contains no loading interface (e.g. spinner or progress).
  isLoading: WritableSignal<boolean> = signal(true);
  /**
   * These 2 properties are boilerplate for presentational components.
   */
  // Replace unknown with the actual data model for both inputs and outputs.
  inputData: InputSignal<unknown | null> = input<unknown | null>(null);
  outputData: OutputEmitterRef<unknown> = output<unknown>();
}
