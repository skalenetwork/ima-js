import Web3 from 'web3';


class IMA {
    readonly web3: Web3;
    // abis: any;
    contracts: Array<number>;
  
    constructor(web3: Web3) {
      this.web3 = web3;
      // this.abis = abis;
      this.contracts = [1, 2 , 3];
    }
  
    async getBlock() {
        return await this.web3.eth.getBlockNumber();
    }

    initContracts() {
        console.log('Init contracts!')
    }

}

export default IMA;
