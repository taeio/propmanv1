export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  ip?: string;
  endpoint?: string;
  method?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private shouldLog(level: LogLevel): boolean {
    const rawLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    
    const logLevel = levels.includes(rawLevel as LogLevel) ? (rawLevel as LogLevel) : 'info';
    
    const currentLevelIndex = levels.indexOf(logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = JSON.stringify(entry);

    switch (entry.level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
      case 'info':
      default:
        console.log(formatted);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.formatLog('debug', message, context);
    this.output(entry);
  }

  info(message: string, context?: LogContext): void {
    const entry = this.formatLog('info', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    const entry = this.formatLog('warn', message, context, error);
    this.output(entry);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const entry = this.formatLog('error', message, context, error);
    this.output(entry);
  }
}

export const logger = new Logger();
