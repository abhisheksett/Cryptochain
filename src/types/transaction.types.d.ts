import Transaction from "../wallet/transaction";
import type { ec as EC } from 'elliptic';
import type { WalletType } from './wallet.types';
import config from "../config";

export type TransactionPoolMap = Record<string, Transaction>;

export type OutputMapType = Record<string, number>;

export type TransactionConstructorInput = {
    senderWallet: WalletType;
    recipient: string;
    amount: number;
    outputMap?: OutputMapType;
    input?: InputTypeForRewardTransaction;
};

export type InputType = {
    timestamp: number;
    amount: number;
    address: string;
    signature: EC.Signature;
};

export type InputTypeForRewardTransaction = typeof config.REWARD_INPUT;