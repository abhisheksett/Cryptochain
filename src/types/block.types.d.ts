
export type BlockData = any;

export type BlockType = {
    timestamp: number;
    lastHash: string;
    hash: string;
    data: BlockData;
    nonce: number;
    difficulty: number;
};

export type MineBlockInput = {
    lastBlock: BlockType;
    data: BlockData;
};

export type AdjustDifficultyInput = {
    originalBlock: BlockType;
    timestamp: number;
}

export type ReplaceChainSuccessCallbackType = () => void;