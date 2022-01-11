import type { TransactionMinerConstructorInput } from '../types/transaction-miner.types';
import Blockchain from '../blockchain';
import Wallet from '../wallet';
import TransactionPool from '../wallet/transaction-pool';
import PubSub from '../app/pubsub';
import Transaction from '../wallet/transaction';

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
        const validTransactions = this.transactionPool.validTransactions();

        // generate miner's reward
        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
        );

        this.blockchain.addBlock({
            data: validTransactions
        });

        // broadcast the chain
        this.pubSub.broadcastChain();

        // clear transaction pool
        this.transactionPool.clear();
    }
}

export default TransactionMiner;