# SKALE IMA-JS

[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/skalenetwork/ima-js/test.yml?label=tests)
![NPM](https://img.shields.io/npm/l/@skalenetwork/ima-js)
![npm](https://img.shields.io/npm/dm/@skalenetwork/ima-js)
![GitHub top language](https://img.shields.io/github/languages/top/skalenetwork/ima-js)

IMA-JS is a Typescript/Javascript library which implements client for SKALE Interchain Messaging Agent (IMA).

ℹ️ IMA-JS v2 is based on [ethers.js](https://github.com/ethers-io/ethers.js/), while v1 was built on top of [web3js](https://github.com/web3/web3.js)

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

## CLI usage

IMA-JS now also available as a standalone command line tool

### Installation

```bash
VERSION_NUM={RELEASE_NAME_HERE} && sudo -E bash -c "curl -L https://github.com/skalenetwork/ima-js/releases/download/$VERSION_NUM/ima-$VERSION_NUM >  /usr/local/bin/ima"
sudo chmod +x /usr/local/bin/ima
```

### Usage

```bash
ima --help
```

#### Connect chains

Example:

```bash
ima connect -n1 chain1 -n2 chain2 -pk1 456 -pk2 123 -e1 http://0.0.0.0:10001 -e2 http://0.0.0.0:10002
```

## Testing

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