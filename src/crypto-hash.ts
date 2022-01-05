
import crypto from 'crypto';

export const cryptoHash = (...inputs: any): string => {
    const hash = crypto.createHash('sha256');
    hash.update(inputs.sort().join(' '));
    return hash.digest('hex');
}