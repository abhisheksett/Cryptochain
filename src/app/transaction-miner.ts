import type { TransactionMinerConstructorInput } from '../types/transaction-miner.types';
import Blockchain from '../blockchain';
import Wallet from '../wallet';
import TransactionPool from '../wallet/transaction-pool';
import PubSub from '../app/pubsub';

class TransactionMiner {

    blockchain: Blockchain;
    transactionPool: TransactionPool;
    wallet: Wallet;
    pubSub: PubSub;

    constructor({ blockchain, transactionPool, wallet, pubsub }: TransactionMinerConstructorInput) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubSub = pubsub;
    }

    mineTransaction() {

    }
}

export default TransactionMiner;