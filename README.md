[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

> [!IMPORTANT]
> **This action supports pnpm v12 and earlier.**
>
> For pnpm v11 and newer, [`pnpm/setup`](https://github.com/pnpm/setup) is also available. It downloads pnpm's self-contained release binary (no Node.js or npm required) and can install a JavaScript runtime (Node.js, Bun, or Deno) in the same step, replacing `actions/setup-node` when its feature set fits your workflow.
>
> You can continue using `pnpm/action-setup` with `actions/setup-node`, including for pnpm v11 and v12. See [Using pnpm/setup instead](#using-pnpmsetup-instead) below if you want a single action to install pnpm and a JavaScript runtime.
>
> `pnpm/setup` cannot install pnpm v11 on Intel macOS (`darwin-x64`), where no standalone pnpm v11 binary is published. On that platform, run `actions/setup-node` with Node.js 22.13 or newer before `pnpm/action-setup`, or upgrade to pnpm v12.

# Setup pnpm

Install pnpm package manager.

## Inputs

### `version`

Version of pnpm to install.

**Optional** when there is a [`packageManager` or `devEngines.packageManager` field in the `package.json`](https://nodejs.org/api/corepack.html).

otherwise, this field is **required** It supports npm versioning scheme, it could be an exact version (such as `10.9.8`), or a version range (such as `10`, `10.x.x`, `10.9.x`, `^10.9.8`, `*`, etc.), or `latest`.

### `dest`

**Optional** Where to store pnpm files.

### `run_install`

**Optional** (_default:_ `null`) If specified, run `pnpm install`.

If `run_install` is either `null` or `false`, pnpm will not install any npm package.

If `run_install` is `true`, pnpm will install dependencies recursively.

If `run_install` is a YAML string representation of either an object or an array, pnpm will execute every install commands.

#### `run_install.recursive`

**Optional** (_type:_ `boolean`, _default:_ `false`) Whether to use `pnpm recursive install`.

#### `run_install.cwd`

**Optional** (_type:_ `string`) Working directory when run `pnpm [recursive] install`.

#### `run_install.args`

**Optional** (_type:_ `string[]`) Additional arguments after `pnpm [recursive] install`, e.g. `[--ignore-scripts, --strict-peer-dependencies]`.

### `cache`

**Optional** (_type:_ `boolean`, _default:_ `false`) Whether to cache the pnpm store directory.

### `cache_dependency_path`

**Optional** (_type:_ `string`, _default:_ `pnpm-lock.yaml`) File path to the pnpm lockfile, whose contents hash will be used as a cache key. Accepts multiple paths delimited by newlines.

### `package_json_file`

**Optional** (_type:_ `boolean`, _default:_ `false`) For pnpm v11 and earlier, install [@pnpm/exe](https://www.npmjs.com/package/@pnpm/exe), enabling pnpm to run without Node.js.

### `standalone`

**Optional** (_type:_ `boolean`, _default:_ `false`) When set to true, [@pnpm/exe](https://www.npmjs.com/package/@pnpm/exe), which is a Node.js bundled package, will be installed, enabling using `pnpm` without Node.js.

For pnpm v12, this input has no effect because the plain `pnpm` package already installs a standalone native executable.

## Outputs

### `dest`

Expanded path of inputs#dest.

### `bin_dest`

Location of `pnpm` and `pnpx` command.

## Usage example

### Install only pnpm without `packageManager`

This works when the repo either doesn't have a `package.json` or has a `package.json` but it doesn't specify `packageManager` or `devEngines.packageManager`.

```yaml
on:
  - push
  - pull_request

jobs:
  install:
    runs-on: ubuntu-latest

    steps:
      - uses: step-security/action-setup@v6
        with:
          version: 10
```

###  Install only pnpm with `packageManager`

Omit `version` input to use the version in the [`packageManager` or `devEngines.packageManager` field in the `package.json`](https://nodejs.org/api/corepack.html).

```yaml
on:
  - push
  - pull_request

jobs:
  install:
    runs-on: ubuntu-latest

    steps:
      - uses: step-security/action-setup@v6
```

### Install pnpm and a few npm packages

```yaml
on:
  - push
  - pull_request

jobs:
  install:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - uses: step-security/action-setup@v6
        with:
          version: 10
          run_install: |
            - recursive: true
              args: [--strict-peer-dependencies]
            - args: [--global, gulp, prettier, typescript]
```

### Use cache to reduce installation time

```yaml
on:
  - push
  - pull_request

jobs:
  cache-and-install:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - uses: step-security/action-setup@v6
        name: Install pnpm
        with:
          version: 10
          cache: true

      - name: Install dependencies
        run: pnpm install
```

**Note:** You don't need to run `pnpm store prune` at the end; post-action has already taken care of that.

### Cache dependencies from multiple lockfiles

```yaml
on:
  - push
  - pull_request
jobs:
  cache-and-install-multiple:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - uses: step-security/action-setup@v6
        with:
          version: 10
          cache: true
          cache_dependency_path: |
            one/pnpm-lock.yaml
            two/pnpm-lock.yaml
          run_install: |
            - cwd: one
            - cwd: two
```

## Notes

This action does not set up Node.js. Use [actions/setup-node](https://github.com/actions/setup-node) yourself. As an alternative for pnpm v11 or newer, [`pnpm/setup`](https://github.com/pnpm/setup) can install pnpm and Node.js in a single step.

