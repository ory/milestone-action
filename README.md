# milestone-action

Generates a markdown document based on milestones, issues, pull requets,
and labels.

## Inputs

### `GITHUB_TOKEN`

**Required** The GitHub Token

### `outputFile`:

The file to write the output to

Default: `MILESTONES.md`

### `labelMilestonePrefix`

Prefix of labels that identify a milestone, for example `/cloud` becomes `cloud/M1`. Only effective in combination with `input.orgs`.

Default: corp/

### `orgs`

Instead of checking this single repository, also check all the repositories of the given orgs (use comma-separated values - `foo,bar,baz`) for issues with prefixed `labelMilestonePrefix` labels.

### `ingoreMilestones`

Ignore milestones with the given names. Ignore multiple milestones with comma-separated values (`foo,bar,baz`).

Default: unplanned

### `onlyLabels`

Only include issues and pull requests with the given labels.

Default: bug,feat,blocking,breaking-change,good-first-issue,docs,ci,rfc,help-wanted

## Example usage

### Multi-org

```yaml
name: Generate and Publish Milestone Document

on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  milestone:
    name: Generate and Publish Milestone Document
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          token: ${{ secrets.TOKEN_PRIVILEGED }}
      - name: Milestone Documentation Generator
        uses: ory/milestone-action@v0
        with:
          GITHUB_TOKEN: ${{ secrets.TOKEN_PRIVILEGED }}
          outputFile: docs/docs/milestones.md
          orgs: ory,ory-corp
      - name: Commit Milestone Documentation
        uses: EndBug/add-and-commit@v4.4.0
        with:
          message: 'autogen(docs): update milestone document'
          author_name: aeneasr
          author_email: '3372410+aeneasr@users.noreply.github.com'
        env:
          GITHUB_TOKEN: ${{ secrets.TOKEN_PRIVILEGED }}
```

### Single repository

```yaml
name: Generate and Publish Milestone Document

on:
  workflow_dispatch:
  issues:
    types:
      [
        opened,
        closed,
        edited,
        demilestoned,
        milestoned,
        reopened,
        assigned,
        unassigned,
        labeled,
        unlabeled,
      ]
  pull_request:
    types:
      [
        opened,
        closed,
        edited,
        demilestoned,
        milestoned,
        reopened,
        assigned,
        unassigned,
        labeled,
        unlabeled,
      ]

jobs:
  milestone:
    name: Generate and Publish Milestone Document
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          token: ${{ secrets.TOKEN_PRIVILEGED }}
      - name: Milestone Documentation Generator
        uses: ory/milestone-action@v0
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          outputFile: docs/docs/milestones.md
      - name: Commit Milestone Documentation
        uses: EndBug/add-and-commit@v4.4.0
        with:
          message: 'autogen(docs): update milestone document'
          author_name: aeneasr
          author_email: '3372410+aeneasr@users.noreply.github.com'
        env:
          GITHUB_TOKEN: ${{ secrets.TOKEN_PRIVILEGED }}
```

## Releasing

```
git tag -a -m "v0" v0
git push --tags
```
