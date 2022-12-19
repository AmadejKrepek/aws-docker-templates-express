import { LogMessage } from './LogMessage';
const util = require('util')
const amqplib = require('amqplib');
import { v4 as uuidv4 } from 'uuid';

export class RabbitMQ {

    constructor(user, pwd, host, port, vhost, amql_url) {
        this.user = user;
        this.pwd = pwd;
        this.host = host;
        this.port = port;
        this.vhost = vhost;
        this.amql_url = amql_url;
    }

    async produce(logType, url, appName, message){
        let objectDate = new Date();

        let day = objectDate.getDate();
        let month = objectDate.getMonth() + 1;
        let year = objectDate.getFullYear();

        let hours = objectDate.getHours();
        let minutes = objectDate.getMinutes();
        let seconds = objectDate.getSeconds();

        if (day < 10) {
            day = '0' + day;
        }
        
        if (month < 10) {
            month = `0${month}`;
        }

        if (hours < 10) {
            hours = `0${hours}`;
        }

        if (minutes < 10) {
            minutes = `0${minutes}`;
        }

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        let dateFormat = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

        var logMessage = new LogMessage();
        logMessage.timestamp = dateFormat;
        logMessage.logType = logType;
        logMessage.url = url;
        logMessage.correlationId = uuidv4();
        logMessage.applicationName = appName;
        logMessage.message = message;

        this.amql_url = util.format("amqp://%s:%s@%s:%s/%s", this.user, this.pwd, this.host, this.port, this.vhost);

        console.log('Started Publishing...')
        var conn = await amqplib.connect(this.amql_url, "heartbeat=60");
        var channel = await conn.createChannel();

        var exchange = 'sipia-rv1-1';
        var queue = 'sipia-rv1-1';
        var rkey = 'zelovarnikey';

        await channel.assertExchange(exchange, 'direct', {durable: true}).catch(console.error);
        await channel.assertQueue(queue, {durable: true});
        await channel.bindQueue(queue, exchange, rkey);

        var msg = `"${logMessage.timestamp} ${logMessage.logType} ${logMessage.url} Correlation: ${logMessage.correlationId} [${logMessage.applicationName}] - <* ${logMessage.message} *>"`;
        await channel.publish(exchange, rkey, Buffer.from(msg));
        setTimeout(() => {
            channel.close();
            conn.close();
        }, 500)

    }
}