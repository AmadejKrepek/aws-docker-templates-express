import {v4 as uuidv4} from 'uuid';

export class LogMessage {
    timestamp: string;
    logtype: string;
    url: string;
    correlationId: string;
    applicationName: string;
    message: string;

    /*
    constructor(timestamp: string, logtype: string, url: string, correlationId: string, applicationName: string, message: string) {
        this.timestamp = timestamp;
        this.logtype = logtype;
        this.url = url;
        this.correlationId = correlationId;
        this.applicationName = applicationName;
        this.message = message;
    }
    */
}