# Deploy and Control Jetton Tokens on TON

## Project structure

-   `contracts` - source code of the Jetton smart contracts and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - run the deployment scripts to deploy new jetton tokens or control already launched tokens.

## How to use

### Deploy or run a script

`npx blueprint run` or `yarn blueprint run`

### Launch a custom Jetton Token

Save the custom FUNC smart contract to ft/jetton-minter-discoverable.fc and run the deploy script.
