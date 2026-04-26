import { FormInputFieldTypeET } from '../enums/html-tag.enum';

export interface FormInputField {
  type: FormInputFieldTypeET;
  value: FormInputFieldValue;
  placeholder?: string;
  disabled?: boolean;
}

export type FormInputFieldValue = string | number | boolean | File | FileList | Date;
