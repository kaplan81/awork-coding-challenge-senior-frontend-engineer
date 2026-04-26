import { Schema as AngularComponentSchema } from '@schematics/angular/component/schema';

import { ComponentType } from './component.enum';

export interface ComponentSchema extends AngularComponentSchema {
  componentType: ComponentType;
  featurePath: string;
  project: string;
}
