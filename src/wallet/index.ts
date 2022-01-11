
import config from '../config';
import { ec, cryptoHash } from '../util';
import type { ec as EC } from 'elliptic';
import type { CalculateBalanceInputType, CreateTransactionInputType } from '../types/wallet.types';
import Transaction from './transaction';

class Wallet {
    balance: number;
    publicKey: string;
    keyPair: EC.KeyPair

    constructor() {
        this.balance = config.STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex', true);
    }

    sign(data: any): EC.Signature {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ amount, recipient, chain }: CreateTransactionInputType): Transaction {

        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }

        if (amount > this.balance) {
            throw new Error('Amount exceeds balance')
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }: CalculateBalanceInputType): number {
        let outputsTotal: number = 0;
        let hasConductedTransaction: boolean = false;

        for (let i = chain.length - 1; i > 0; i--) {
            const block = chain[i];

            for (let transaction of block.data) {
                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];

                if (addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }
            }

            if (hasConductedTransaction) {
                break;
            }
        }
        return hasConductedTransaction ? outputsTotal : config.STARTING_BALANCE + outputsTotal;
    }
}

export default Wallet;