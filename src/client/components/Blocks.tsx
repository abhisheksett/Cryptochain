
import React, { useState, useEffect } from "react";
import Block from './Block';
import type { BlockType } from "../../types/block.types";

const Blocks: React.FC = () => {

    const [blocks, setBlocks] = useState<BlockType[]>([]);

    const fetchBlocks = async () => {
        try {
            const result = await fetch('http://localhost:3000/api/blocks');
            result.json().then((data: BlockType[]) => {
                setBlocks(data);
            })
        } catch (e: unknown) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    return (
        <div>
            <h3>Blocks</h3>
            {blocks.map(block => <Block key={block.hash} block={block} />)}
        </div>
    );
}

export default Blocks;