
import config from '../config';
import { ec, cryptoHash } from '../util';
import type { ec as EC } from 'elliptic';
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

    createTransaction({ amount, recipient }: { amount: number, recipient: string }): Transaction {
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance')
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }
}

export default Wallet;