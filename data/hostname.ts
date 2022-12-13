export const prod_hostname = {
    accountService: 'http://accountservice'
}

export const dev_hostname = {
    accountService: 'http://studentdocker.informatika.uni-mb.si:12670'
}

export const hostname = process.env.NODE_ENV == 'Production' ? prod_hostname : dev_hostname;