/**
 * Logs only in development mode.
 */
export function log(msg: string, ...optional: any[]): void {
    if (process.env.NODE_ENV === "development") {
        console.log(msg, ...optional);
    }
}

/**
 * Logs to stderr.
 */
export function error(msg: string, ...optional: any[]): void {
    console.error(msg, ...optional);
}

/**
 * Logs to stderr and exits the process with code 1.
 */
export function fatal(msg: string, ...optional: any[]): void {
    console.error(msg, ...optional);
    process.exit(1);
}
