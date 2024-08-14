import { createLogger, format, transports } from 'winston';
const { combine, timestamp, prettyPrint, printf } = format;

// Custom format for pretty-printing JSON objects
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let log = `${timestamp} [${level}]: `;

  if (typeof message === 'object') {
    log += JSON.stringify(message, null, 2); // Pretty print the message if it's an object
  } else {
    log += message;
  }

  if (Object.keys(metadata).length > 0) {
    log += JSON.stringify(metadata, null, 2); // Pretty print JSON with 2 spaces indentation
  }
  return log;
});

export const logger = createLogger({
  //level: process.env.LOG_LEVEL || 'info',
  level: 'info',
  format: combine(
    timestamp(),
    prettyPrint(), // This will format the JSON objects
    customFormat // Use the custom format defined above
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ]
});