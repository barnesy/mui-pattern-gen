export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    // Set log level based on environment
    if (this.isDevelopment) {
      this.logLevel = LogLevel.DEBUG;
    } else {
      this.logLevel = LogLevel.WARN;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${levelStr} ${contextStr} ${message}`;
  }

  private addToHistory(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
    };

    this.addToHistory(entry);

    const formattedMessage = this.formatMessage(level, message, context);

    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          // eslint-disable-next-line no-console
          console.log(formattedMessage, data || '');
          break;
        case LogLevel.WARN:
           
          console.warn(formattedMessage, data || '');
          break;
        case LogLevel.ERROR:
           
          console.error(formattedMessage, data || '');
          break;
      }
    }

    // In production, you could send logs to a service like Sentry, LogRocket, etc.
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      // TODO: Send to error tracking service
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  // Get log history for debugging
  getHistory(): LogEntry[] {
    return [...this.logs];
  }

  // Clear log history
  clearHistory(): void {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return this.logs
      .map((entry) => {
        const levelStr = LogLevel[entry.level];
        const contextStr = entry.context ? `[${entry.context}]` : '';
        const dataStr = entry.data ? JSON.stringify(entry.data) : '';
        return `${entry.timestamp.toISOString()} ${levelStr} ${contextStr} ${entry.message} ${dataStr}`;
      })
      .join('\n');
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logDebug = (message: string, context?: string, data?: unknown): void =>
  logger.debug(message, context, data);
export const logInfo = (message: string, context?: string, data?: unknown): void =>
  logger.info(message, context, data);
export const logWarn = (message: string, context?: string, data?: unknown): void =>
  logger.warn(message, context, data);
export const logError = (message: string, context?: string, data?: unknown): void =>
  logger.error(message, context, data);
