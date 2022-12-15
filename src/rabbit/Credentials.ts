export class Credentials {
    user: string;
    pwd: string;
    host: string;
    port: string;
    vhost: string;
    amql_url: string;

    getCredentials(): Credentials {
        const user = process.env.NODE_ENV == 'Production' ? 'student' : 'student';
        const pwd = process.env.NODE_ENV == 'Production' ? 'student123' : 'student123';
        const host = process.env.NODE_ENV == 'Production' ? '172.17.0.77' : 'studentdocker.informatika.uni-mb.si';
        const port = process.env.NODE_ENV == 'Production' ? '5672' : '5672';

        var creds = new Credentials();
        creds.user = user;
        creds.pwd = pwd;
        creds.host = host;
        creds.port = port;
        creds.vhost = '';

        return creds;
    }
}
