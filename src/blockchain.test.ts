import Blockchain from './blockchain';
import Block from './block';
import { cryptoHash } from './crypto-hash';

describe('Blockchain', () => {
    const blockchain = new Blockchain();

    it('contains a chain array instance', () => {
        expect(blockchain.chain).toBeInstanceOf(Array);
    });

    it('starts with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({
            data: newData
        });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    })
});

describe('isValidChain', () => {
    let blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
    });

    describe('When the chain doesnt start with a genesis block', () => {
        it('returns false', () => {
            blockchain.chain[0].data = 'fake-data';
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
    });

    describe('When the chain starts with a genesis block and has multiple blocks', () => {

        beforeEach(() => {
            blockchain.addBlock({ data: 'Avengers' });
            blockchain.addBlock({ data: 'Avengers Infinity War' });
            blockchain.addBlock({ data: 'Avengers End Game' });
        });

        describe('and a lastHash reference has changed', () => {
            it('returns false', () => {
                blockchain.chain[2].lastHash = 'broken-last-hash';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('the chain contains a block with invalid field', () => {
            it('returns false', () => {
                blockchain.chain[2].data = 'evil-data';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('And the chain contains a block with jumped difficulty', () => {
            it('returns false', () => {
                const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                const lastHash = lastBlock.hash;
                const timestamp = Date.now();
                const nonce = 0;
                const data = [];
                const difficulty = lastBlock.difficulty - 3;
                const hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

                const badBlock = new Block({
                    timestamp, data, difficulty, hash, lastHash, nonce
                });

                blockchain.chain.push(badBlock);

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            })
        });

        describe('the chain doesnt contain any invalid blocks', () => {
            it('returns true', () => {
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
            })
        });
    });
});

describe('replaceChain()', () => {
    let blockchain, newChain, originalChain;
    let errorMock, logMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;

        errorMock = jest.fn();
        logMock = jest.fn();

        // setting console functions to dummy so it'll supress console errors/logs
        global.console.error = errorMock;
        global.console.log = logMock;
    });

    describe('When new chain is not longer', () => {

        beforeEach(() => {
            newChain.chain[0].data = 'Changed data';
            blockchain.replaceChain(newChain.chain);
        });

        it('doesnt replace the chain', () => {
            expect(blockchain.chain).toEqual(originalChain);
        });

        it('logs error', () => {
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('When the incoming chain is longer', () => {
        beforeEach(() => {
            newChain.addBlock({ data: 'Avengers' });
            newChain.addBlock({ data: 'Avengers Infinity War' });
            newChain.addBlock({ data: 'Avengers End Game' });
        });
        describe('When the chain is invalid', () => {
            beforeEach(() => {
                newChain.chain[2].hash = 'fake-hash';
                blockchain.replaceChain(newChain.chain);
            });

            it('doesnt replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs error', () => {
                expect(errorMock).toHaveBeenCalled();
            });

        });

        describe('When the chain valid', () => {
            beforeEach(() => {
                blockchain.replaceChain(newChain.chain);
            });

            it('replaces the chain', () => {
                expect(blockchain.chain).toEqual(newChain.chain);
            });

            it('logs about chain replacement', () => {
                expect(logMock).toHaveBeenCalled();
            });
        });
    })
})