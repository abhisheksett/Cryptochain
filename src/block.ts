import hexToBinary from 'hex-to-binary';
import type { BlockType, MineBlockInput, AdjustDifficultyInput } from './block.types';
import config from './config';
import { cryptoHash } from './crypto-hash';

class Block {

    timestamp: number;
    lastHash: string;
    hash: string;
    data: string;
    nonce: number;
    difficulty: number;

    constructor(props: BlockType) {
        const { timestamp, lastHash, hash, data, nonce, difficulty } = props;
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        const { GENESIS_DATA } = config;
        return new this(GENESIS_DATA);
    }

    static mineBlock(input: MineBlockInput) {
        const { lastBlock, data } = input;
        // const timestamp = Date.now();
        const { hash: lastHash } = lastBlock;
        let difficulty = lastBlock.difficulty;
        let hash: string, timestamp: number;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty)); // converting has to binary for increasing difficulty

        return new this({
            timestamp,
            data,
            lastHash,
            nonce,
            difficulty,
            hash
        })
    }

    static adjustDifficulty({ originalBlock, timestamp }: AdjustDifficultyInput): number {
        const { difficulty } = originalBlock;
        if (difficulty < 1) {
            return 1;
        }
        if ((timestamp - originalBlock.timestamp) > config.MINE_RATE) {
            return difficulty - 1;
        }
        return difficulty + 1;
    }
}

export default Block;