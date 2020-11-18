# ORY prettier-styles

The prettier config used by all ORY projects.

# GitHub Action

This also defines a GitHub action to use for format checking. Usage similar to:

```yaml
name: Check format

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

jobs:
  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ory/prettier-styles@v1
```
