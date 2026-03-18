# Bundle Size

![Linter](https://github.com/m0rr1s-p/github-action-bundle-size/actions/workflows/linter.yml/badge.svg)
![CI](https://github.com/m0rr1s-p/github-action-bundle-size/actions/workflows/ci.yml/badge.svg)
![Check dist/](https://github.com/m0rr1s-p/github-action-bundle-size/actions/workflows/check-dist.yml/badge.svg)
![Coverage](./badges/coverage.svg)

Use this action to check bundle size. It provides insights into the size of your
JavaScript bundles, helping you optimize performance and reduce load times.

## Inputs

| Name             | Description                             | Required | Default |
| ---------------- | --------------------------------------- | -------- | ------- |
| `base-path`      | The path to the base branch's bundle    | true     | none    |
| `current-path`   | The path to the current branch's bundle | true     | none    |
| `create-comment` | Whether to create a comment on the PR   | false    | false   |

## Outputs

| Name             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `current-js`     | The size of the current .js files                                 |
| `current-js-gz`  | The size of the current gzipped .js files                         |
| `current-css`    | The size of the current .css files                                |
| `current-css-gz` | The size of the current gzipped .css files                        |
| `base-js`        | The size of the base .js files                                    |
| `base-js-gz`     | The size of the base gzipped .js files                            |
| `base-css`       | The size of the base .css files                                   |
| `base-css-gz`    | The size of the base gzipped .css files                           |
| `delta-js`       | Difference in size of .js files between the two branches          |
| `delta-css`      | Difference in size of .css files between the two branches         |
| `delta-js-gz`    | Difference in gzipped size of .js files between the two branches  |
| `delta-css-gz`   | Difference in gzipped size of .css files between the two branches |
| `comment`        | The comment to post                                               |

## Usage

Create a workflow and check out the two branches you want to compare. This
action will calculate the size difference between the two branches, allowing you
to identify any significant changes in bundle size.

```yaml
name: Bundle Size
on:
  pull_request:

jobs:
  size-check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Checkout Base Branch
        uses: actions/checkout@v6
        with:
          ref: main
          path: base

      - name: Checkout PR Branch
        uses: actions/checkout@v6
        with:
          ref: ${{ github.head_ref }}
          path: current

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version-file: current/app/src/main/svelte/.node-version
          cache: pnpm
          cache-dependency-path: current/app/src/main/svelte/pnpm-lock.yaml

      - name: Build PR branch
        working-directory: current/app/src/main/svelte
        run: |
          pnpm install --frozen-lockfile
          pnpm build

      - name: Build Base branch
        working-directory: base/app/src/main/svelte
        run: |
          pnpm install --frozen-lockfile
          pnpm build

      - name: Bundle Size Check
        uses: m0rr1s-p/github-action-bundle-size@releases/v1
        with:
          base-path: base/src/main/resources/assets/svelte/build
          current-path: current/src/main/resources/assets/svelte/build
          create-comment: true

      - name: Find Comment
        if: ${{ github.event_name == 'pull_request' }}
        uses: peter-evans/find-comment@v4
        id: fc
        with:
          issue-number: ${{ github.event.pull_request.number }}
          comment-author: 'github-actions[bot]'
          body-includes: Bundle Size

      - name: Post Comment
        if: ${{ github.event_name == 'pull_request' }}
        uses: peter-evans/create-or-update-comment@v5
        with:
          comment-id: ${{ steps.fc.outputs.comment-id }}
          issue-number: ${{ github.event.pull_request.number }}
          edit-mode: replace
          body: ${{ steps.size-check.outputs.comment }}
```
