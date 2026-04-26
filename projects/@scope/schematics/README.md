# Custom Schematics

This package contains custom Angular schematics for the project.

Even though it is designed for local development, it is possible to build it as an npm package to be re-used as an installable artifact in other repositories.

## Contribution

When working with this project we should always take the root of this repository/workspace as current working directory.

Let us take, for instance that we are developing our custom schematics for components. We wil have to run these 2 commands:

```bash
npm run build:fz-schematics:watch
npm run schematics:component -- --project=my-project --feature-path=my-feature --component-type=c --name=tailored-boilerplate
```

The former will listen to the TypeScript changes you apply on the schematics script and update the compilation automatically.

The latter will run the schematic itself with all the required options specified in e.g. the authored `projects/@scope/schematics/src/component/schema.json`, which in this case extends the actual Angular schema for components.

However, this will apply a dry run, since this is anabled by default for local collections. If this is not desired or you want to test the actual file creation, just add `--dry-run=false` to the command.

## Component

At the root `package.json` we have introduced a wrapper command with non specific options:

```bash
npm run generate:component
```

The schematic will ask several questions:

1. Which Angular project are you creating this component for?
2. Please provide the feature/domain name which matches the name of the existing folder (e.g., 'dashboard', 'contact')
3. What type of component is this? If you do not know the difference, please check the guidelines.
4. What name would you like to use for the component?

The guidelines the schematics questions are referring to are located in `.cursor/rules/angular/ng-component/ng-component.rule.mdc`.

The generated code will look similar to the one you can find in `projects/@scope/schematics/src/component/snippets`.

On top of that, the script will also run the Vitest test with the pertinent flag to create or update the Vitest Snapshots.
