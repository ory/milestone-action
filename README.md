# milestone-action

Generates a markdown document based on milestones, issues, pull requets,
and labels.

## Inputs

### `GITHUB_TOKEN`

**Required** The GitHub Token

### `outputFile`:

The file to write the output to

Default: `MILESTONES.md`

## Example usage

```yaml
name: Generate and Publish Milestone Document

on:
  workflow_dispatch:
  issues:
    types: [opened, closed, edited, demilestoned, milestoned, reopened, assigned, unassigned, labeled, unlabeled]
  pull_request:
    types: [opened, closed, edited, demilestoned, milestoned, reopened, assigned, unassigned, labeled, unlabeled]

jobs:
  milestone:
    name: Generate and Publish Milestone Document
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Milestone Documentation Generator
        uses: ory/milestone-action@v0.0.9
        with:
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
          outputFile: docs/docs/milestones.md
      - name: Commit Milestone Documentation
        uses: EndBug/add-and-commit@v4.4.0
        with:
          message: "autogen(docs): update milestone document"
          author_name: aeneasr
          author_email: "3372410+aeneasr@users.noreply.github.com"
```
