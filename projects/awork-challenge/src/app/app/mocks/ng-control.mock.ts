import { FormControl, NgControl } from '@angular/forms';
import { vi } from 'vitest';

export class NgControlMock extends NgControl {
  control = new FormControl();
  viewToModelUpdate = vi.fn();
}
