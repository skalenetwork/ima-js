# SKALE IMA-JS

Typescirpt/Javascript library which implements client for SKALE Interchain Messaging Agent (IMA).

## Usage

See main documentation: https://docs.skale.network/ima/1.0.x/

### Mainnet Chain

#### Initialize a chain

```typescript
    import MainnetChain from '@skalenetwork/ima-js';

    let provider = new Web3.providers.HttpProvider(MAINNET_ENDPOINT);
    let web3 = new Web3(provider);
    let abi = helper.jsonFileLoad(MAINNET_ABI_FILEPATH);
    let mainnetChain = new MainnetChain(web3, abi);
```

#### Get ETH balance

This method returns ETH balance on the Mainnet

```typescript
    let balance = await mainnetChain.ethBalance(address);
```

### SKALE Chain

#### Initialize a chain

```typescript
    import sChain from '@skalenetwork/ima-js';

    let provider = new Web3.providers.HttpProvider(SCHAIN_ENDPOINT);
    let web3 = new Web3(provider);
    let abi = helper.jsonFileLoad(SCHAIN_ABI_FILEPATH);
    let sChain = new SChain(web3, abi);
```

#### Get ETH balance

This method returns real ETH balance locked on the sChain

```typescript
    let balance = await sChain.ethBalance(address);
```

## Development

### Testing

Deploy test tokens:

```shell
yarn deploy-tokens
```

Run tests:

```shell
yarn test
```

### Linter

Used linter: https://palantir.github.io/tslint/  

Install the global CLI and its peer dependency:

```bash
yarn global add tslint typescript
```

#### Linter git hook

Be sure to add pre-commit git hook:

```shell
echo 'yarn lint' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```
