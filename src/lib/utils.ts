import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Debug utility for consistent logging across the application
 */
export class Debug {
    private static enabled: boolean = false;
    private static readonly PREFIX = '[TandemDebug]';

    /**
     * Enable debug logging
     */
    static enable(): void {
        Debug.enabled = true;
        Debug.log('Debug', 'Debug logging enabled');
    }

    /**
     * Disable debug logging
     */
    static disable(): void {
        Debug.log('Debug', 'Debug logging disabled');
        Debug.enabled = false;
    }

    /**
     * Log a debug message if debug is enabled
     * @param context The context of the log message
     * @param message The message to log
     * @param data Additional data to log
     */
    static log(context: string, message: string, data?: any): void {
        if (!Debug.enabled) return;

        if (data !== undefined) {
            console.log(`${Debug.PREFIX} [${context}] ${message}`, data);
        } else {
            console.log(`${Debug.PREFIX} [${context}] ${message}`);
        }
    }

    /**
     * Log an error message
     * @param context The context of the error
     * @param message The error message
     * @param error The error object
     */
    static error(context: string, message: string, error?: Error): void {
        if (error) {
            console.error(`${Debug.PREFIX} [${context}] ${message}`, error);
        } else {
            console.error(`${Debug.PREFIX} [${context}] ${message}`);
        }
    }

    /**
     * Log a warning message
     * @param context The context of the warning
     * @param message The warning message
     * @param data Additional data to log
     */
    static warn(context: string, message: string, data?: any): void {
        if (data !== undefined) {
            console.warn(`${Debug.PREFIX} [${context}] ${message}`, data);
        } else {
            console.warn(`${Debug.PREFIX} [${context}] ${message}`);
        }
    }
}