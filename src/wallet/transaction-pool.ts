import Transaction from "./transaction";
import type { TransactionPoolMap } from '../types/transaction.types';

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
}

export default TransactionPool;