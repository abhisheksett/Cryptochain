import { v4 as uuidv4 } from 'uuid';
import { verifySignature } from '../util';
import config from '../config';
import type { WalletType } from '../types/wallet.types';
import type {
    TransactionConstructorInput,
    OutputMapType,
    InputType,
    InputTypeForRewardTransaction,
    TransactionConstructorInputForReward
} from '../types/transaction.types';
import Wallet from '.';

const { MINING_REWARD, REWARD_INPUT } = config;
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
     *      "public key of sender": "available balance after transfer"
     *  },
     *  input: {
     *      timestamp: "transaction time",
     *      amount: "sender's wallet balance BEFORE transaction",
     *      address: "sender's public key",
     *      signature: "signature generated by signing outputmap"
     *  }
     * }
     */
    constructor({ senderWallet, recipient, amount, outputMap, input }: TransactionConstructorInput) {
        this.id = uuidv4();
        this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
        this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }: TransactionConstructorInput): OutputMapType {
        const outputMap: OutputMapType = {};
        outputMap[recipient as string] = amount;
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

        const outputTotal = Object.values(outputMap).reduce((total, currentAmount) => total + currentAmount);

        if (amount !== outputTotal) {
            // console.log('-------------transaction', transaction, outputTotal)

            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        return true;
    }

    static rewardTransaction({ minerWallet }: { minerWallet: Wallet }): Transaction {
        const rewardInput = { ...REWARD_INPUT, signature: minerWallet.sign([]) }
        return new this({
            input: rewardInput,
            outputMap: {
                [minerWallet.publicKey]: MINING_REWARD
            },
            senderWallet: new Wallet(), // this is just dummy field and it won't be considered as input and output are being passed
            recipient: '', // this is just dummy field and it won't be considered as input and output are being passed
            amount: 0 // this is just dummy field and it won't be considered as input and output are being passed
        })
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

/**
 * Sample Transaction Object:
 * 
 {
  "id": "3ff30007-d684-4dfd-bc30-d9a7711cd547",
  "input": {
    "address": "021145fdffec2aa1c457f900f0888b8c384f0d8151b2c206ce79353fbfa6b47c61",
    "amount": 1000,
    "signature": {
      "r": "e94625f1ba772632e94e6673341c3591e00e1af40350dc3c018623b4393ed08b",
      "recoveryParam": 1,
      "s": "9deeacf9491890fef0444542b53e68a74bf3d85cc1f004eac783a7bace46ef4d"
    },
    "timestamp": 1641478949014
  },
  "outputMap": {
    "021145fdffec2aa1c457f900f0888b8c384f0d8151b2c206ce79353fbfa6b47c61": 950,
    "5e09ae3b5be6ce220966a064f4a7a78e8069664807a75e3b623e2eee40106936": 50
  }
}
 */