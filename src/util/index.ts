import { ec as EC } from 'elliptic';
import config from '../config';
import { cryptoHash } from './crypto-hash';
import type { VerifySignatureInput } from '../types/crypto.types';

export const ec = new EC(config.CRYPTO_METHOD);

export const verifySignature = ({ publicKey, data, signature }: VerifySignatureInput): boolean => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
    return keyFromPublic.verify(cryptoHash(data), signature);
}

export { cryptoHash }