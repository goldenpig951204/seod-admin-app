const path = require("path");
const moment = require("moment");
const winston = require("winston");
require("winston-daily-rotate-file");

const defaultFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.splat(),
    winston.format.printf(msg => `[${msg.level}] ${moment.utc(msg.timestamp).format('DD/MM/YYYY hh:mm:ss')} ${msg.message}`)
);

const serverLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/server-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const semrushLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/semrush-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const spyfuLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/spyfu-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const seolyzeLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/seolyze-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const sistrixLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/sistrix-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const linkcentaurLog = winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/linkcentaur-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const spamzillaLog =  winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/spamzilla-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

const seodityLog =  winston.createLogger({
    format: defaultFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../public/logs/seodity-%DATE%.log'),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '500k',
            maxFiles: '7d', // Auto delete the log after 7 days
        }),
    ],
});

module.exports = {
    serverLog,
    semrushLog,
    spyfuLog,
    seolyzeLog,
    sistrixLog,
    linkcentaurLog,
    spamzillaLog,
    seodityLog
}