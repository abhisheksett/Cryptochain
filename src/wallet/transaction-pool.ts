import Transaction from "./transaction";
import type { TransactionPoolMap } from '../types/transaction.types';
import type { BlockType } from '../types/block.types';

class TransactionPool {

    transactionMap: TransactionPoolMap;

    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction: Transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    existingTransaction({ inputAddress }: { inputAddress: string }): Transaction | undefined {
        const transactions = Object.values(this.transactionMap);
        return transactions.find((transaction: Transaction) => transaction.input.address === inputAddress);
    }

    setMap(transactionMap: TransactionPoolMap) {
        this.transactionMap = transactionMap;
    }

    validTransactions(): Transaction[] {
        return Object.values(this.transactionMap)
            .filter((transaction) => Transaction.validTransaction(transaction))
    }

    clear(): void {
        this.transactionMap = {};
    }

    clearBlockchainTransactions({ chain }: { chain: BlockType[] }): void {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];

            for (let transaction of block.data) {
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

export default TransactionPool;