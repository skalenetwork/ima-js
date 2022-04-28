# SKALE IMA-JS

[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)

IMA-JS is a Typescript/Javascript library which implements client for SKALE Interchain Messaging Agent (IMA).

## Installation

### Node

```shell
npm install --save @skalenetwork/ima-js
```

### Yarn

```shell
yarn add @skalenetwork/ima-js
```

## Usage

Full usage documentation with examples can be found on our docs portal: https://docs.skale.network/ima/1.3.x/

## Development

### Git clone with submodules

```shell
git clone --recurse-submodules --remote-submodules https://github.com/skalenetwork/ima-js
```

### IMA-SDK

Version `0.3.0` is compatible with ima-sdk `0.2.1`

### Testing

> Check out GA test workflow in `.github/workflows/test.yml` to see all steps.

Deploy test tokens:

```shell
INSTALL_PACKAGES=True yarn deploy-tokens
```

Run tests:

```shell
yarn test
```

### Linter

Used linter: https://palantir.github.io/tslint/  

Install the global CLI and its peer dependency:

```shell
yarn global add tslint typescript
```

#### Linter git hook

Be sure to add pre-commit git hook:

```shell
echo 'yarn lint' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## License

![GitHub](https://img.shields.io/github/license/skalenetwork/skale.py.svg)

All contributions are made under the [GNU Lesser General Public License v3](https://www.gnu.org/licenses/lgpl-3.0.en.html). See [LICENSE](LICENSE).
