import Wallet from '.';
import config from '../config';
import { verifySignature } from '../util';
import Transaction from './transaction';

describe('Transaction', () => {
    let transaction: Transaction, senderWallet: Wallet, recipient: string, amount: number;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({ senderWallet, recipient, amount })
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the `senderWallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey])
                .toEqual(senderWallet.balance - amount);
        });
    });

    describe('input', () => {
        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });
        it('has a `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });
        it('sets the `amount` to senderWallet balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });
        it('sets the address to senderWallet publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });
        it('signs the input', () => {
            expect(verifySignature({
                publicKey: senderWallet.publicKey,
                data: transaction.outputMap,
                signature: transaction.input.signature
            })).toBe(true);
        })
    });

    describe('validTransaction()', () => {
        let errorMock;

        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
        });
        describe('when transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            })
        });

        describe('when transaction is INvalid', () => {
            describe('and transaction `outputMap` value is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 9999999;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toBeCalled();
                })
            });

            describe('and transaction `input` signature is invalid', () => {
                it('returns false and logs an error', () => {
                    transaction.input.signature = new Wallet().sign('fake-data');
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toBeCalled();
                })
            });
        });
    });

    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe('and the amount is invalid', () => {

            it('throws an error', () => {
                expect(() => {
                    transaction.update({
                        senderWallet, recipient: 'random-recipient', amount: 999999
                    })
                }).toThrow('Amount exceeds balance');
            });
        });
        describe('the amount is valid', () => {
            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;

                transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount })
            });

            it('outputs the amount to next recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            it('subtracts the amount from original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalSenderOutput - nextAmount);
            });

            it('it maintains total output that matches input amount', () => {
                expect(
                    Object.values(transaction.outputMap).reduce((total: number, amount: number) => total + amount)
                ).toEqual(transaction.input.amount);
            });

            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });

            describe('and another update but for same recipient', () => {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 50;
                    transaction.update({
                        senderWallet,
                        recipient: nextRecipient,
                        amount: addedAmount
                    })
                });

                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient])
                        .toEqual(nextAmount + addedAmount)
                });

                it('subtracts the amount from original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey])
                        .toEqual(originalSenderOutput - nextAmount - addedAmount);
                })
            })
        });
    });

    describe('rewardTransaction()', () => {
        let rewardTransaction: Transaction, minerWallet: Wallet;

        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({ minerWallet });
        });

        it('it creates a transacrion with the reward input', () => {
            expect(rewardTransaction.input).toEqual(config.REWARD_INPUT);
        });

        it('creates one transaction for the miner with the `MINING_REWARD`', () => {
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(config.MINING_REWARD);
        })
    })
});