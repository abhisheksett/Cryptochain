
import type { curve, eddsa, ec as EC } from 'elliptic';

export type VerifySignatureInput = {
    publicKey: string;
    data: any;
    signature: EC.Signature;
}