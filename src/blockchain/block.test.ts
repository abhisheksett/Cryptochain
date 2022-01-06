import hexToBinary from 'hex-to-bin';
import Block from './block';
import config from '../config';
import { cryptoHash } from '../util';

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({
        timestamp,
        data,
        hash,
        lastHash,
        nonce,
        difficulty
    });

    it('has a timestamp, lastHash, data and hash property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    })

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns a block instance', () => {
            expect(genesisBlock).toBeInstanceOf(Block);
        });

        it('returns genesis data', () => {
            expect(genesisBlock).toEqual(config.GENESIS_DATA)
        })
    });

    describe('mineBlock', () => {
        const lastBlock = Block.genesis();
        const data = ['mined data'];
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it('returns a block instance', () => {
            expect(minedBlock).toBeInstanceOf(Block);
        });

        it('sets `lastHash` to be the `hash` of last block', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a SHA-256 `hash` based on proper input', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(
                minedBlock.timestamp,
                minedBlock.nonce,
                minedBlock.difficulty,
                lastBlock.hash,
                data
            ));
        });

        it('sets a hash that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        })
    });

    describe('adjustDifficulty', () => {
        it('raises the difficulty of a quickly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + config.MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('lowers the difficulty of a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + config.MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has a lower limit of 1', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({ originalBlock: block, timestamp })).toEqual(1);
        })
    });

});