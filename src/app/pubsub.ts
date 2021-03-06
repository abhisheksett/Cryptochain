// import { createClient } from 'redis';
// @ts-ignore
import redis from 'redis';
import Blockchain from '../blockchain';
import TransactionPool from '../wallet/transaction-pool';
import type { PublishInput } from '../types/pubsub.types';
import Transaction from '../wallet/transaction';

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

class PubSub {

    publisher: any; // @todo: need to add specific type
    subscriber: any; // @todo: need to add specific type
    blockchain: Blockchain;
    transactionPool: TransactionPool;

    constructor({ blockchain, transactionPool }: { blockchain: Blockchain, transactionPool: TransactionPool }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannel();
        this.subscriber.on('message', (channel: string, message: string) => this.handleMessage(channel, message));

        // (async () => {
        //     try {
        //         this.publisher = createClient();
        //         this.subscriber = createClient();

        //         this.publisher.on('error', (err: any) => console.log('Redis Client publisher error', err));
        //         this.subscriber.on('error', (err: any) => console.log('Redis Client subscriber error', err));

        //         await this.publisher.connect();
        //         await this.subscriber.connect();

        //         this.subscriber.subscribe(CHANNELS.TEST);
        //         this.subscriber.on('message', (channel: any, message: any) => this.handleMessage(channel, message));
        //         // this.publisher.on('message', () => console.log('ok'));


        //     } catch (e) {
        //         console.error(e);
        //     }
        // })()
    }

    handleMessage(channel: string, message: string) {
        console.log(`message received. Channel: ${channel}, Message: ${message}`);

        const parsedMessage = JSON.parse(message);

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    })
                });
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }

    subscribeToChannel() {
        Object.values(CHANNELS).forEach(channel => this.subscriber.subscribe(channel));
    }

    publish({ channel, message }: PublishInput) {
        // before publishing, unsubscribe from the channel. This will
        //prevent sending message to own
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }

    broadcastTransaction(transaction: Transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

export default PubSub;