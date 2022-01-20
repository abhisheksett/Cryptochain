import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';
import type { TransactionPoolMap } from '../../types/transaction.types';

const TRANSACTION_INTERVAL_MS = 10000;

const TransactionPool: React.FC = () => {

    const [transactionPoolMap, setTransactionPoolMap] = useState<TransactionPoolMap>({});

    const history = useHistory();

    const fetchTransactionPoolMap = async (): Promise<void> => {
        const result = await fetch(`${document.location.origin}/api/transaction-pool-map`);
        result.json().then((data: TransactionPoolMap) => {
            setTransactionPoolMap(data);
        })
    };

    useEffect(() => {
        fetchTransactionPoolMap();

        const interval = setInterval(() => {
            fetchTransactionPoolMap();
        }, TRANSACTION_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        }
    }, []);

    const mineTransactions = async (): Promise<void> => {
        try {
            const result = await fetch(`${document.location.origin}/api/mine-transaction`);
            if (result.status === 200) {
                history.push('/blocks')
            } else {
                alert('Mine transaction failed !!')
            }
        } catch (e: unknown) {
            console.error(e);
        }
    };

    return (
        <div className='transaction-pool'>
            <Link to="/">Home</Link>
            <br />
            <h3>Transaction Pool</h3>
            <div>
                {
                    Object.values(transactionPoolMap).map(transaction => {
                        return (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
            </div>
            <hr />
            <Button
                variant="danger"
                size="sm"
                onClick={mineTransactions}>
                Mine the Transactions
            </Button>
        </div>
    );
};

export default TransactionPool;