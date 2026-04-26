import { NodeWorkflow } from '@angular-devkit/schematics/tools';

export class ComponentSchematicWorkflow extends NodeWorkflow {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  public _dryRun: boolean;
}
