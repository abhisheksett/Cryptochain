import React from "react";
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './components/App';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransactions';
import TransactionPool from './components/TransactionPool';
import './style.scss';


render(
    <Router>
        <Switch>
            <Route exact component={App} path="/" />
            <Route component={Blocks} path="/blocks" />
            <Route component={ConductTransaction} path="/conduct-transaction" />
            <Route component={TransactionPool} path="/transaction-pool" />
        </Switch>
    </Router>,
    document.getElementById('root'));