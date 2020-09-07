import winston = require('winston');

const getLogger = (): winston.Logger => {
  const alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
      all: true,
    }),
    winston.format.label({
      label: '[code-gif-generator]',
    }),
    winston.format.timestamp({
      format: 'YY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => {
      return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`;
    }),
  );

  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format((info) => {
        info.level = info.level.toUpperCase();
        return info;
      })(),
      winston.format.colorize(),
      alignColorsAndTime,
    ),
  });
  return winston.createLogger({ transports: [consoleTransport] });
};

const log = getLogger();

export default log;
