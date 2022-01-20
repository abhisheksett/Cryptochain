import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import type { WalletInfo } from '../../types/apiResponse.types';
import logo from '../assets/blockchain.png';

const App: React.FC = () => {
    const [address, setAddress] = useState<string>('');
    const [balance, setBalance] = useState<number>(0);

    const fetchData = async (): Promise<void> => {
        try {
            const result = await fetch(`${document.location.origin}/api/wallet-info`);
            result.json().then((data: WalletInfo) => {
                setAddress(data.address);
                setBalance(data.balance);
            });

        } catch (e: unknown) {

        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="App">
            <img className="logo" src={logo} alt="logo" />
            <h2>Welcome to Blockchain</h2>
            <br />
            <br />
            <div><Link to="/blocks">Blocks</Link></div>
            <div><Link to="/conduct-transaction">Conduct a Transaction</Link></div>
            <div><Link to="/transaction-pool">Transaction Pool</Link></div>

            <br />
            <div className="wallet-info">
                <div>Address - {address}</div>
                <div>Balance - {balance}</div>
            </div>
        </div>
    )
};

export default App;