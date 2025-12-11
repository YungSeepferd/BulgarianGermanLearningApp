/**
 * Dependency Injection Container
 *
 * This module provides a centralized container for managing service dependencies
 * across the application, enabling better testability and loose coupling.
 */

import { ProgressService } from './progress';
import { loadVocabulary, initializeVocabulary } from '../data/loader';
import { LessonGenerationEngine } from './lesson-generation/lesson-generator';
import { lessonTemplateRepository } from './lesson-generation/lesson-templates';
import { culturalGrammarService } from './lesson-generation/cultural-grammar';
import { templateRenderer } from './lesson-generation/template-renderer';
import { AppDataState } from '../state/app-data.svelte';
import { EventBus } from './event-bus';
import { LearningSession } from '../state/session.svelte';

// Define service types
// Import VocabularyService type for type checking (but not for instantiation)
import type { _VocabularyService } from '../data/vocabulary';

type ServiceTypes = {
    progressService: ProgressService;
    lessonGenerationEngine: LessonGenerationEngine;
    eventBus: EventBus;
    learningSession: LearningSession;
};

// Singleton DI container
class DIContainer {
    private static instance: DIContainer;
    private services: Partial<ServiceTypes> = {};
    private eventBus: EventBus;
    private isInitialized = false;
    private initializationPromise: Promise<void> | null = null;

    private constructor() {
        // Initialize event bus
        this.eventBus = new EventBus();
        this.services.eventBus = this.eventBus;
    }

    public static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    /**
     * Initialize all services
     */
    public async initialize(): Promise<void> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = new Promise<void>(async (resolve, reject) => {
            try {
                // Initialize event bus first
                this.services.eventBus = this.eventBus;

                // Initialize ProgressService - it's independent
                this.services.progressService = new ProgressService(this.eventBus);

                // Initialize LearningSession - now independent of ProgressService
                this.services.learningSession = new LearningSession(this.eventBus);

                // Note: AppDataState is now initialized separately to avoid circular dependencies

                // VocabularyService has been removed - vocabulary data is loaded directly

                // Initialize LessonGenerationEngine with dependencies
                this.services.lessonGenerationEngine = new LessonGenerationEngine(
                    lessonTemplateRepository,
                    culturalGrammarService,
                    templateRenderer
                );

                this.isInitialized = true;
                resolve();
            } catch (error) {
                console.error('DI Container initialization failed:', error);
                reject(error);
            }
        });

        return this.initializationPromise;
    }

    /**
     * Get a service by type
     * @param serviceName The name of the service to get
     */
    public getService<T extends keyof ServiceTypes>(serviceName: T): ServiceTypes[T] {
        // Ensure initialization is complete before accessing services
        if (!this.isInitialized) {
            throw new Error(`Service ${serviceName} cannot be accessed: DI container not initialized. ` +
                          `Make sure to await diContainer.initialize() before accessing services.`);
        }

        if (!this.services[serviceName]) {
            throw new Error(`Service ${serviceName} not initialized. ` +
                          `Make sure diContainer.initialize() has been called successfully.`);
        }

        return this.services[serviceName];
    }

    /**
     * Get the AppDataState instance (initialized separately to avoid circular dependencies)
     */
    public getAppDataState(): any {
        // This will be replaced with proper AppDataState import after initialization
        throw new Error('AppDataState should be accessed through app-state.ts to avoid circular dependencies');
    }

    /**
     * Register a service instance
     * @param serviceName The name of the service
     * @param instance The service instance
     */
    public registerService<T extends keyof ServiceTypes>(serviceName: T, instance: ServiceTypes[T]): void {
        this.services[serviceName] = instance;
    }

    /**
     * Get the event bus
     */
    public getEventBus(): EventBus {
        return this.eventBus;
    }
}

// Create and initialize the DI container
export const diContainer = DIContainer.getInstance();

// Initialize services
diContainer.initialize().catch(error => {
    console.error('Failed to initialize DI container:', error);
});

// Export event bus immediately since it doesn't require initialization
export const eventBus = diContainer.getEventBus();

// Export a function to get services after initialization
export function getProgressService(): ProgressService {
    return diContainer.getService('progressService');
}

// VocabularyService has been removed - vocabulary data is loaded directly via loader functions

/**
 * Get vocabulary data
 */
export async function getVocabularyData() {
    return await loadVocabulary();
}

// Export vocabulary initialization function
export async function initializeVocabularyData() {
    return await initializeVocabulary();
}

export function getLessonGenerationEngine(): LessonGenerationEngine {
    return diContainer.getService('lessonGenerationEngine');
}

// Note: AppDataState is initialized separately in app-state.ts to avoid circular dependencies