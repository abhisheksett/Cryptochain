import Wallet from '../wallet';
import type { BlockType } from './block.types';

export type WalletType = Wallet;

export type CalculateBalanceInputType = {
    chain: BlockType[];
    address: string;
};

export type CreateTransactionInputType = {
    amount: number;
    recipient: string;
    chain?: BlockType[];
}
