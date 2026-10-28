const { existsSync, mkdir } = require("fs");
const path = require("path");
const winston = require("winston");

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white"
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.printf(
        (info) =>
            `${info.timestamp}[${info.level}]: ${info.message}`
    )
);

const logDir = path.join(process.cwd(), "log");

if (!existsSync(logDir)) {
    mkdir(logDir, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
    });
}

const transports = [

    // Console logs
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            format
        )
    }),

    // Error logs file
    new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error"
    }),

    // Optional: all logs file
    new winston.transports.File({
        filename: path.join(logDir, "info.log"),
        level: "info"
    })
];

const Logger = winston.createLogger({
    levels,
    format,
    transports
});

module.exports = Logger;