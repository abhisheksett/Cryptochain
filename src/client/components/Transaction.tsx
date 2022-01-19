
import React, { useEffect, useState } from "react";
import TransactionType from "../../wallet/transaction";

type TransactionInputType = {
    transaction: TransactionType;
};

const Transaction: React.FC<TransactionInputType> = (props: TransactionInputType) => {
    const { input, outputMap } = props.transaction;
    const recipients = Object.keys(outputMap);

    return (
        <div className="transaction">
            <div>From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}</div>
            {
                recipients.map(recipient => {
                    return (
                        <div key={recipient}>
                            To:  {`${recipient.substring(0, 20)}...`} | Sent: {outputMap[recipient]}
                        </div>
                    )
                })
            }
        </div>
    )
};

export default Transaction;