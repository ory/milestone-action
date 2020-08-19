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

```
name: Generate Milestone Documentation
uses: ory/milestone-action@v0.0.3
with:
  GITHUB_TOKEN: ${ secrets.GITHUB_TOKEN }
```
