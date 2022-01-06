// import { createClient } from 'redis';
// @ts-ignore
import redis from 'redis';
import Blockchain from '../blockchain';
import type { PublishInput } from '../types/pubsub.types';

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub {

    publisher: any; // @todo: need to add specific type
    subscriber: any; // @todo: need to add specific type
    blockchain: Blockchain;

    constructor({ blockchain }: { blockchain: Blockchain }) {
        this.blockchain = blockchain;
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
        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage);
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
}

export default PubSub;