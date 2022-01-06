import Wallet from '../wallet';
import type { ec as EC } from 'elliptic';

export type OutputMapType = Record<string, number>;

export type WalletType = Wallet;

export type TransactionConstructorInput = {
    senderWallet: WalletType;
    recipient: string;
    amount: number;
};

export type InputType = {
    timestamp: number;
    amount: number;
    address: string;
    signature: EC.Signature;
}