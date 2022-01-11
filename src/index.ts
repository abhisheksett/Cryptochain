import express from 'express';
import request from 'request';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import PubSub from './app/pubsub';
import TransactionPool from './wallet/transaction-pool';
import Transaction from './wallet/transaction';
import Wallet from './wallet';
import TransactionMiner from './app/transaction-miner';

const app = express();
app.use(bodyParser.json());
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;
    let transaction: Transaction | undefined = transactionPool.existingTransaction({ inputAddress: wallet.publicKey })
    try {
        // if transaction exists, then update the existing transaction
        if (transaction) {
            transaction.update({ senderWallet: wallet, amount, recipient });
        } else {
            transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
        }
    } catch (err: any) {
        return res.status(400).json({ type: 'error', message: err.message })
    }
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap)
});

app.get('/api/mine-transaction', (req, res) => {
    transactionMiner.mineTransaction();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address
        })
    })
})

// Sync chain on startup
const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    })
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    // select any port between 0 to 999 and add with default port
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
    //Don't call sync when root node is starting
    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});