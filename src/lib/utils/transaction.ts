/**
 * Transaction Utility for Atomic State Updates
 *
 * This module provides a transaction mechanism to ensure that related state updates
 * succeed or fail together, maintaining data consistency across the application.
 */

import { Debug } from '$lib/utils';
import { ErrorHandler } from '$lib/services/errors';

/**
 * Transaction class for managing atomic operations
 */
export class Transaction {
    private operations: Array<() => Promise<void>> = [];
    private rollbackOperations: Array<() => Promise<void>> = [];
    private isCommitted = false;

    /**
     * Add an operation to the transaction
     * @param operation The operation to execute
     * @param rollback The rollback operation if the transaction fails
     */
    addOperation(operation: () => Promise<void>, rollback: () => Promise<void>): void {
        this.operations.push(operation);
        this.rollbackOperations.push(rollback);
    }

    /**
     * Execute all operations in the transaction
     * @throws Error if any operation fails
     */
    async commit(): Promise<void> {
        if (this.isCommitted) {
            throw new Error('Transaction already committed');
        }

        const executedOperations: Array<() => Promise<void>> = [];

        try {
            // Execute all operations in sequence
            for (const operation of this.operations) {
                await operation();
                executedOperations.push(operation);
            }

            this.isCommitted = true;
        } catch (error: unknown) {
            Debug.error('Transaction', 'Transaction failed, rolling back', error as Error);

            const errors: Error[] = [];

            // Rollback in reverse order
            for (let i = executedOperations.length - 1; i >= 0; i--) {
                try {
                    const rollbackIndex = this.operations.indexOf(executedOperations[i]);
                    if (rollbackIndex !== -1 && this.rollbackOperations[rollbackIndex]) {
                        await this.rollbackOperations[rollbackIndex]();
                    } else {
                        Debug.error('Transaction', 'No rollback operation found for operation', executedOperations[i]);
                        errors.push(new Error(`No rollback operation found for operation: ${executedOperations[i]}`));
                    }
                } catch (rollbackError: unknown) {
                    const typedRollbackError = rollbackError instanceof Error ? rollbackError : new Error(String(rollbackError));
                    Debug.error('Transaction', 'Rollback failed for operation', typedRollbackError);
                    errors.push(typedRollbackError);
                    // Continue with other rollbacks even if one fails
                }
            }

            ErrorHandler.handleError(error as Error, 'Transaction failed and rolled back');
            throw error;
        }
    }

    /**
     * Check if the transaction has been committed
     */
    isComplete(): boolean {
        return this.isCommitted;
    }
}

/**
 * Transaction Manager for coordinating multiple transactions
 */
export class TransactionManager {
    private static activeTransactions: Map<string, Transaction> = new Map();

    /**
     * Start a new transaction
     * @param transactionId Unique identifier for the transaction
     */
    static startTransaction(transactionId: string): Transaction {
        if (this.activeTransactions.has(transactionId)) {
            throw new Error(`Transaction with ID ${transactionId} already exists`);
        }

        const transaction = new Transaction();
        this.activeTransactions.set(transactionId, transaction);
        return transaction;
    }

    /**
     * Get an existing transaction
     * @param transactionId Unique identifier for the transaction
     */
    static getTransaction(transactionId: string): Transaction | null {
        return this.activeTransactions.get(transactionId) || null;
    }

    /**
     * Commit a transaction
     * @param transactionId Unique identifier for the transaction
     */
    static async commitTransaction(transactionId: string): Promise<void> {
        const transaction = this.activeTransactions.get(transactionId);
        if (!transaction) {
            throw new Error(`Transaction with ID ${transactionId} not found`);
        }

        await transaction.commit();
        this.activeTransactions.delete(transactionId);
    }

    /**
     * Rollback a transaction
     * @param transactionId Unique identifier for the transaction
     */
    static async rollbackTransaction(transactionId: string): Promise<void> {
        const transaction = this.activeTransactions.get(transactionId);
        if (!transaction) {
            throw new Error(`Transaction with ID ${transactionId} not found`);
        }

        // Rollback is handled automatically in the commit method when an error occurs
        this.activeTransactions.delete(transactionId);
    }
}