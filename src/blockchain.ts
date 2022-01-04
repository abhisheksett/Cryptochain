import Block from './block';
import type { BlockType, BlockData } from './block.types';
import { cryptoHash } from './crypto-hash';

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

    replaceChain(incomingChain: BlockType[]) {
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

        console.log('replacing chain with', incomingChain);
        this.chain = incomingChain;
    }

}

export default Blockchain;