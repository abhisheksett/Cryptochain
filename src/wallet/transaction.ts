import { v4 as uuidv4 } from 'uuid';
import { verifySignature } from '../util';
import type {
    TransactionConstructorInput,
    OutputMapType,
    WalletType,
    InputType
} from '../types/wallet.types';

class Transaction {

    id: string;
    outputMap: OutputMapType;
    input: InputType;

    /**
     * 
     * transaction object structure:
     * {
     *  id: uuid,
     *  outputMap: {
     *      "public key of recipient": "amount transferred",
     *      "publick key of sender": "available balance after transfer"
     *  },
     *  input: {
     *      timestamp: "transaction time",
     *      amount: "sender's wallet balance BEFORE transaction",
     *      address: "sender's public key",
     *      signature: "signature generated by signing outputmap"
     *  }
     * } 
     */
    constructor({ senderWallet, recipient, amount }: TransactionConstructorInput) {
        this.id = uuidv4();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }: TransactionConstructorInput): OutputMapType {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({ senderWallet, outputMap }: { senderWallet: WalletType, outputMap: OutputMapType }): InputType {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    }

    static validTransaction(transaction: Transaction): boolean {
        const { input: { address, amount, signature }, outputMap } = transaction;

        const outputTotal = Object.values(outputMap).reduce((total, amount) => total + amount);

        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        return true;
    }

    update({ senderWallet, recipient, amount }: TransactionConstructorInput) {
        const senderWalletBalance = this.outputMap[senderWallet.publicKey];

        if (amount > senderWalletBalance) {
            throw new Error('Amount exceeds balance')
        }

        // if the recipient doesnt exist on outputMap then add the amount
        // else add the amount to existing recipient
        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }

        this.outputMap[senderWallet.publicKey] = senderWalletBalance - amount;

        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

}

export default Transaction;