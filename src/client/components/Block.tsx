import React, { useState } from "react";
import { Button } from 'react-bootstrap';
import Transaction from "./Transaction";
import type { BlockType } from "../../types/block.types";

type BlockInputType = {
    block: BlockType
};

const Block: React.FC<BlockInputType> = (prop: BlockInputType) => {

    const [displayTransaction, setDisplayTransaction] = useState<boolean>(false);

    const { block: { timestamp, hash, data } } = prop;
    const hashDisplay = `${hash.substring(0, 15)}...`;
    const stringifiedData = JSON.stringify(data);

    const toggleTransaction = () => {
        console.log(displayTransaction)
        setDisplayTransaction(!displayTransaction);
    };

    const display = (): React.ReactElement => {
        const dataDisplay = stringifiedData.length > 35 ? `${stringifiedData.substring(0, 35)}...` : stringifiedData;
        if (displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (<><hr /><Transaction key={transaction.id} transaction={transaction} /></>))
                    }
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={toggleTransaction}>
                        Show less
                    </Button>
                </div>
            )
        }
        return (
            <div>
                Data: {dataDisplay}
                <br />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={toggleTransaction}>
                    Show more
                </Button>
            </div>
        )
    };

    return (
        <div className="block">
            <div>Hash: {hashDisplay}</div>
            <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
            {display()}
        </div>
    );
};

export default Block;