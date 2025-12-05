import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface ILoggerConfig {
  level: LogLevel;
  component?: string;
  enableColors?: boolean;
  enableTimestamp?: boolean;
}

export class Logger {
  private static instance: Logger;
  private config: ILoggerConfig;

  private constructor(
    config: ILoggerConfig = {
      level: LogLevel.INFO,
      enableColors: true,
      enableTimestamp: true,
    }
  ) {
    this.config = config;
  }

  public static getInstance(config?: ILoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  public static create(component: string, level?: LogLevel): Logger {
    const instance = Logger.getInstance();
    return new Logger({
      ...instance.config,
      component,
      level: level ?? instance.config.level,
    });
  }

  private formatMessage(level: string, message: string, component?: string): string {
    const parts: string[] = [];

    if (this.config.enableTimestamp) {
      const timestamp = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
      parts.push(chalk.gray(`[${timestamp}]`));
    }

    const levelFormatted = this.formatLevel(level);
    parts.push(levelFormatted);

    if (component || this.config.component) {
      const comp = component || this.config.component;
      parts.push(chalk.cyan(`[${comp}]`));
    }

    parts.push(message);

    return parts.join(' ');
  }

  private formatLevel(level: string): string {
    if (!this.config.enableColors) {
      return `[${level}]`;
    }

    switch (level) {
      case 'ERROR':
        return chalk.red.bold('[ERROR]');
      case 'WARN':
        return chalk.yellow.bold('[WARN]');
      case 'INFO':
        return chalk.blue('[INFO]');
      case 'DEBUG':
        return chalk.gray('[DEBUG]');
      default:
        return `[${level}]`;
    }
  }

  public debug(message: string, component?: string): void {
    if (this.config.level <= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, component));
    }
  }

  public info(message: string, component?: string): void {
    if (this.config.level <= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', message, component));
    }
  }

  public warn(message: string, error?: Error | unknown, component?: string): void {
    if (this.config.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, component));
      if (error) {
        if (error instanceof Error) {
          console.warn(chalk.yellow(`  Stack: ${error.stack}`));
        } else {
          console.warn(chalk.yellow(`  Details: ${JSON.stringify(error, null, 2)}`));
        }
      }
    }
  }

  public error(message: string, error?: Error | unknown, component?: string): void {
    if (this.config.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, component));
      if (error) {
        if (error instanceof Error) {
          console.error(chalk.red(`  Stack: ${error.stack}`));
        } else {
          console.error(chalk.red(`  Details: ${JSON.stringify(error, null, 2)}`));
        }
      }
    }
  }

  public success(message: string, component?: string): void {
    if (this.config.level <= LogLevel.INFO) {
      const formattedMessage = this.config.enableColors ? chalk.green(message) : message;
      console.log(this.formatMessage('INFO', formattedMessage, component));
    }
  }

  public progress(message: string, component?: string): void {
    if (this.config.level <= LogLevel.INFO) {
      const formattedMessage = this.config.enableColors
        ? chalk.blue(`🔍 ${message}`)
        : `🔍 ${message}`;
      console.log(this.formatMessage('INFO', formattedMessage, component));
    }
  }

  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  public setComponent(component: string): void {
    this.config.component = component;
  }

  public getLevel(): LogLevel {
    return this.config.level;
  }
}

// Default logger instance
export const logger = Logger.getInstance({
  level: process.env.LOG_LEVEL
    ? (LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.INFO)
    : LogLevel.INFO,
  enableColors: true,
  enableTimestamp: true,
});

// Convenience functions for creating component-specific loggers
export const createLogger = (component: string, level?: LogLevel): Logger => {
  return Logger.create(component, level);
};
