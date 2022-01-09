

const INITIAL_DIFFICULTY = 3;

export default {
    MINE_RATE: 1000, // global mine rate in milisecond
    GENESIS_DATA: {
        timestamp: 1,
        lastHash: '_____',
        data: [],
        hash: 'hash-one',
        nonce: 0,
        difficulty: INITIAL_DIFFICULTY
    },
    STARTING_BALANCE: 1000,
    CRYPTO_METHOD: 'secp256k1',
    REWARD_INPUT: {
        ADDRESS: '*authorized-reward*'
    },
    MINING_REWARD: 50
}