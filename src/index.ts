import express from 'express';
import request from 'request';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import PubSub from './app/pubsub';

const app = express();
app.use(bodyParser.json());
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

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


// Sync chain on startup
const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
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
        syncChains();
    }
});