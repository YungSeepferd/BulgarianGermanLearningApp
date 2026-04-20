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
 *
 * Delegates to LoggerService for structured logging with in-memory buffer.
 * Maintains backward compatibility with existing Debug.log/error/warn calls.
 * Auto-enabled in dev mode via LoggerService.
 */
import { logger } from '$lib/services/logger';

export class Debug {
    private static enabled: boolean = import.meta.env.DEV;

    /**
     * Enable debug logging
     */
    static enable(): void {
        Debug.enabled = true;
        logger.setConsoleLevel('debug');
        Debug.log('Debug', 'Debug logging enabled');
    }

    /**
     * Disable debug logging
     */
    static disable(): void {
        Debug.log('Debug', 'Debug logging disabled');
        Debug.enabled = false;
        logger.setConsoleLevel(import.meta.env.DEV ? 'debug' : 'error');
    }

    /**
     * Log a debug message if debug is enabled
     * @param context The context of the log message
     * @param message The message to log
     * @param data Additional data to log
     */
    static log(context: string, message: string, data?: unknown): void {
        if (!Debug.enabled) return;
        logger.debug(context, message, data);
    }

    /**
     * Log an error message - always captured by LoggerService
     * @param context The context of the error
     * @param message The error message
     * @param error The error object
     */
    static error(context: string, message: string, error?: Error): void {
        logger.error(context, message, error);
    }

    /**
     * Log a warning message if debug is enabled
     * @param context The context of the warning
     * @param message The warning message
     * @param data Additional data to log
     */
    static warn(context: string, message: string, data?: unknown): void {
        if (!Debug.enabled) return;
        logger.warn(context, message, data);
    }
}
