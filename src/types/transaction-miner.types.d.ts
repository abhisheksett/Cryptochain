import Blockchain from '../blockchain';
import Wallet from '../wallet';
import TransactionPool from '../wallet/transaction-pool';
import PubSub from '../app/pubsub';

export type TransactionMinerConstructorInput = {
    blockchain: Blockchain;
    transactionPool: TransactionPool;
    wallet: Wallet;
    pubsub: PubSub;
};