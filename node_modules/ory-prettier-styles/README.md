# Ory prettier-styles

![CI status](https://github.com/ory/prettier-styles/actions/workflows/test.yml/badge.svg)

The [Prettier](https://prettier.io/) configuration used by all ORY projects.

### Local setup

To use the Prettier configuration without modifications, add this line to your
**package.json** file:

```json
  "prettier": "ory-prettier-styles",
```

To use the Prettier configuration with modifications, create a file
**.prettierrc.js** with this content:

```js
module.exports = {
  ...require("ory-prettier-styles"),
  // your custom Prettier settings here
}
```

### GitHub Action

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
