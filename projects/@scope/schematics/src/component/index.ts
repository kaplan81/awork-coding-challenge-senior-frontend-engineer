import { normalize, strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { execSync } from 'child_process';

import { Schema as AngularComponentSchema } from '@schematics/angular/component/schema';
import {
  getWorkspace,
  ProjectDefinition,
  WorkspaceDefinition,
} from '@schematics/angular/utility/workspace';

import { directoryExists } from '../utils/tree.util';
import { ComponentExtraOptions, ComponentType } from './component.enum';
import { ComponentSchematicWorkflow } from './node.model';
import { ComponentSchema } from './schema.model';

export default function (schema: ComponentSchema): (tree: Tree) => Promise<Rule> {
  return async (tree: Tree): Promise<Rule> => {
    const schematicsPackageName = '@schematics/angular';
    const sourceAppPath = 'src/app';
    const workspace: WorkspaceDefinition = await getWorkspace(tree);
    const project: ProjectDefinition | undefined = workspace.projects.get(schema.project);
    if (project === undefined) {
      throw new Error(`Project ${schema.project} not found`);
    }
    const prefix: string | undefined = (project as ProjectDefinition).prefix;
    if (prefix === undefined) {
      throw new Error(`Project ${schema.project} has no prefix`);
    }
    const workspaceSchematics = (workspace.extensions['schematics'] ?? {}) as Record<
      string,
      unknown
    >;
    const projectSchematics = (project.extensions['schematics'] ?? {}) as Record<string, unknown>;
    const container = Object.keys(ComponentType)[0];
    const component = Object.keys(ComponentType)[1];
    const schematicsKey = `${schematicsPackageName}:${component}`;
    const ngComponentSchematics = {
      ...(workspaceSchematics[schematicsKey] ?? {}),
      ...(projectSchematics[schematicsKey] ?? {}),
    } as AngularComponentSchema;
    const customOptions: ComponentSchema = {
      ...schema,
      ...ngComponentSchematics,
      prefix,
    };
    const typeFolder: string =
      customOptions.componentType === ComponentType.container ? `${container}s` : `${component}s`;
    const basePath = `projects/${customOptions.project}/${sourceAppPath}/${customOptions.featurePath}`;
    checkFeatureDirectory({ basePath, tree });
    const path: string = normalize(`${basePath}/${typeFolder}`);
    const angularOptions: AngularComponentSchema = cleanComponentOptions(customOptions, path);
    const fullComponentPath = `${path}/${customOptions.name}`;

    return chain([
      externalSchematic(schematicsPackageName, component, angularOptions),
      mergeWith(
        apply(url('./files'), [
          applyTemplates({
            ...strings,
            ...customOptions,
          }),
          move(normalize(fullComponentPath)),
        ]),
        MergeStrategy.Overwrite,
      ),
      runVitestSnapshots(fullComponentPath),
    ]);
  };
}

/**
 * Validates if the target feature directory exists in the file system.
 *
 * @throws Error if the directory does not exist
 */
function checkFeatureDirectory({ basePath, tree }: { basePath: string; tree: Tree }): void {
  if (!directoryExists(tree, basePath)) {
    throw new Error(
      `Directory "${basePath}" does not exist. Make sure you provided the correct feature path.`,
    );
  }
}

/**
 * Helper function to remove custom properties not supported by Angular's component schematic
 *
 * @returns Clean options object compatible with Angular's component schematic
 */
function cleanComponentOptions(options: ComponentSchema, path: string): AngularComponentSchema {
  const cleanOptions = { ...options };
  Object.keys(ComponentExtraOptions)
    .filter((key) => isNaN(Number(key)))
    .forEach((key: string) => {
      delete cleanOptions[key as keyof ComponentSchema];
    });

  return { ...cleanOptions, path } as AngularComponentSchema;
}

/**
 * Custom rule to execute Vitest snapshot tests
 *
 * @returns a rule for the chain
 */
function runVitestSnapshots(componentPath: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const isDryRun: boolean =
      (context.engine.workflow as ComponentSchematicWorkflow | null)?._dryRun ?? true;
    if (!isDryRun) {
      process.nextTick(() => {
        try {
          execSync(`make test ${componentPath}/*.spec.ts`, { stdio: 'inherit' });
          context.logger.info('Vitest snapshots created successfully');
        } catch (error) {
          context.logger.warn(`Vitest snapshots failed: ${error}`);
        }
      });
    } else {
      context.logger.info('Skipping Vitest snapshots in dry run mode');
    }

    return tree;
  };
}
