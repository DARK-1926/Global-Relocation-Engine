/**
 * Structured Logger with timestamps and categorized events.
 * Logs: API call durations, cache hits/misses, scoring events, partial failures.
 *
 * Also collects events into a request-scoped activity log that can be
 * sent to the frontend for real-time visibility into backend operations.
 */

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

export type LogCategory = 'API_CALL' | 'CACHE' | 'SCORING' | 'PARTIAL_FAILURE' | 'ANALYZE' | 'SERVER' | 'NORMALIZE' | 'EXCHANGE';

export interface LogEvent {
    timestamp: string;
    level: LogLevel;
    category: LogCategory;
    icon: string;
    message: string;
    meta?: Record<string, any>;
}

const CATEGORY_ICONS: Record<LogCategory, string> = {
    API_CALL: '🌐',
    CACHE: '💾',
    SCORING: '📊',
    PARTIAL_FAILURE: '⚠️',
    ANALYZE: '🔍',
    SERVER: '🖥️',
    NORMALIZE: '📐',
    EXCHANGE: '💱'
};

class Logger {
    private _activityLog: LogEvent[] = [];
    private _collecting: boolean = false;

    /** Start collecting events for a request */
    startCollecting(): void {
        this._activityLog = [];
        this._collecting = true;
    }

    /** Stop collecting and return all events */
    stopCollecting(): LogEvent[] {
        this._collecting = false;
        const events = [...this._activityLog];
        this._activityLog = [];
        return events;
    }

    private _addEvent(level: LogLevel, category: LogCategory, message: string, meta: Record<string, any> = {}): LogEvent {
        const timestamp = new Date().toISOString();
        const event: LogEvent = {
            timestamp,
            level,
            category,
            icon: (CATEGORY_ICONS as any)[category] || '📋',
            message,
            ...(Object.keys(meta).length > 0 ? { meta } : {})
        };
        if (this._collecting) {
            this._activityLog.push(event);
        }
        return event;
    }

    private _format(level: LogLevel, category: LogCategory, message: string, meta: Record<string, any> = {}): string {
        const timestamp = new Date().toISOString();
        const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] [${category}] ${message}${metaStr}`;
    }

    info(category: LogCategory, message: string, meta: Record<string, any> = {}): void {
        this._addEvent(LogLevel.INFO, category, message, meta);
        console.log(this._format(LogLevel.INFO, category, message, meta));
    }

    warn(category: LogCategory, message: string, meta: Record<string, any> = {}): void {
        this._addEvent(LogLevel.WARN, category, message, meta);
        console.warn(this._format(LogLevel.WARN, category, message, meta));
    }

    error(category: LogCategory, message: string, meta: Record<string, any> = {}): void {
        this._addEvent(LogLevel.ERROR, category, message, meta);
        console.error(this._format(LogLevel.ERROR, category, message, meta));
    }

    debug(category: LogCategory, message: string, meta: Record<string, any> = {}): void {
        this._addEvent(LogLevel.DEBUG, category, message, meta);
        console.log(this._format(LogLevel.DEBUG, category, message, meta));
    }

    apiCall(apiName: string, durationMs: number, success: boolean, meta: Record<string, any> = {}): void {
        this.info('API_CALL', `${apiName} completed in ${durationMs}ms`, {
            ...meta,
            durationMs,
            success
        });
    }

    cacheEvent(key: string, hit: boolean): void {
        const hitStr = hit ? '\x1b[32mHIT\x1b[0m' : '\x1b[31mMISS\x1b[0m';
        this.info('CACHE', `${hitStr} for key: ${key}`, { hit });
    }

    scoringEvent(country: string, scores: any): void {
        this.info('SCORING', `Computed scores for ${country}`, scores);
    }

    partialFailure(country: string, failedApis: string[]): void {
        this.warn('PARTIAL_FAILURE', `Partial data for ${country}`, { failedApis });
    }
}

const logger = new Logger();
export default logger;
