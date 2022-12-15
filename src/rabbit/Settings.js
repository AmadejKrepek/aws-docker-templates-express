import { Credentials } from '../rabbit/Credentials';
const { RabbitMQ } = require('../rabbit/RabbitMq')

export function getSettings() {
  const prod_hostname = {
    accountService: "http://accountservice:20",
  };

  const dev_hostname = {
    accountService: "http://studentdocker.informatika.uni-mb.si:12670",
  };

  const hostname =
    process.env.NODE_ENV == "Production"
      ? prod_hostname.accountService
      : dev_hostname.accountService;

  var credentials = new Credentials();
  var creds = credentials.getCredentials();

  var rbmq = new RabbitMQ(
    creds.user,
    creds.pwd,
    creds.host,
    creds.port,
    creds.vhost,
    creds.amql_url
  );

  let message = "It works!";
  let url = 'http://studentdocker.informatika.uni-mb.si:15555/';
  let logType = "INFO";
  let appName = "OrdersService";

  let settings = {
    hostname: hostname,
    rbmq: rbmq,
    msg: message,
    type: logType,
    name: appName,
    url: url
  }

  return settings;
}

export function getUrl(route) {
    let url = `http://studentdocker.informatika.uni-mb.si:15555/${route}`
    return url;
}
