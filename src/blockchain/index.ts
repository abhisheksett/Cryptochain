import Block from './block';
import type { BlockType, BlockData, ReplaceChainSuccessCallbackType } from '../types/block.types';
import { cryptoHash } from '../util';
import config from '../config';
import Transaction from '../wallet/transaction';
import Wallet from '../wallet';

class Blockchain {

    chain: BlockType[];

    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }: { data: BlockData }) {
        const newBlock = Block.mineBlock({
            data,
            lastBlock: this.chain[this.chain.length - 1]
        });

        this.chain.push(newBlock);
    }

    static isValidChain(chainToBeValidated: BlockType[]): boolean {
        // check if genesis block is correct
        if (JSON.stringify(chainToBeValidated[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        // check if hashes are matching
        for (let i = 1; i < chainToBeValidated.length; i++) {
            const { data, hash, lastHash, timestamp, difficulty, nonce } = chainToBeValidated[i];
            const previousHash = chainToBeValidated[i - 1].hash;
            const lastDifficulty = chainToBeValidated[i - 1].difficulty;
            if (lastHash !== previousHash) {
                return false;
            }

            if (Math.abs(lastDifficulty - difficulty) > 1) {
                return false;
            }

            // match the current hash
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash) {
                return false;
            }
        }
        return true;
    }

    replaceChain(
        incomingChain: BlockType[],
        validateTransaction?: boolean,
        onSuccess?: ReplaceChainSuccessCallbackType
    ) {
        // if incoming chain length is smaller, don't do anything
        if (incomingChain.length <= this.chain.length) {
            console.error('Incoming chain must be longer');
            return;
        }

        // If incoming chain is not valid, then return
        if (!Blockchain.isValidChain(incomingChain)) {
            console.error('Incoming chain must be valid')
            return;
        }

        // if incoming chain has invalid data, then return
        if (validateTransaction && !this.validTransactionData({ chain: incomingChain })) {
            console.error('Incoming chain has invalid data');
            return;
        }

        if (onSuccess) {
            onSuccess();
        }
        console.log('replacing chain with', incomingChain);
        this.chain = incomingChain;
    }

    validTransactionData({ chain }: { chain: BlockType[] }): boolean {
        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {
                // check if it is reward transaction
                if (transaction.input.address === config.REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) {
                        console.error('Miner reward exceeds limit');
                        return false;
                    }

                    // reward transaction outputMap will have only one entry
                    // check if the amount is equal to mining reward
                    if (Object.values(transaction.outputMap)[0] !== config.MINING_REWARD) {
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                } else {
                    // if the transaction is not valid, return false
                    if (!Transaction.validTransaction(transaction)) {
                        console.log('-------validTransaction', transaction)
                        console.error('Invalid transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount')
                        return false;
                    }

                    // If the transaction is present more than once, then return false
                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction appears more than once')
                        return false;
                    } else {
                        transactionSet.add(transaction);
                    }
                }

            }
        }
        return true;
    }

}

export default Blockchain;