// SPDX-License-Identifier: AGPL-3.0-only

/**
 * @license
 * SKALE IMA JS
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file truffle-config.js
 * @copyright SKALE Labs 2019-Present
 */

// more information about configuration can be found at: truffleframework.com/docs/advanced/configuration

const hdwalletProvider = require( "@truffle/hdwallet-provider" );

const privateKey = process.env.ETH_PRIVATE_KEY;
const endpoint = process.env.ENDPOINT;


module.exports = {
    networks: {
        mn: {
            provider: () => { return new hdwalletProvider(privateKey, endpoint); },
            network_id: "*",
            networkCheckTimeout: 10000,
            skipDryRun: true
        },
        sc: {
            provider: () => { return new hdwalletProvider(privateKey, endpoint); },
            network_id: "*",
            networkCheckTimeout: 10000,
            skipDryRun: true
        }
    },
    mocha: { // set default mocha options here, use special reporters etc.
        // timeout: 100000
    },
    compilers: { // configure compiler(s)
        solc: {
            version: "0.5.0", // fetch exact version from solc-bin (default is truffle's version)
            docker: true,     // use "0.5.1" you've installed locally with docker (default is "false")
            settings: {       // see the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: false,
                    runs: 200
                },
                evmVersion: "byzantium"
            }
        }
    }
};
