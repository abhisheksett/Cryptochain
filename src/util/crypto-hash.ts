
import crypto from 'crypto';

export const cryptoHash = (...inputs: any): string => {
    const hash = crypto.createHash('sha256');
    hash.update(inputs.map((input: any) => JSON.stringify(input)).sort().join(' '));
    return hash.digest('hex');
}