/**
 * Error Types Unit Tests
 * Tests the structured error handling system
 * @since 1.0.0
 */

import {
  VocabularyError,
  NetworkError,
  ValidationError,
  StorageError,
  ParsingError,
  SystemError,
  ErrorCategory,
  ErrorSeverity,
  ErrorFactory,
  RetryStrategy
} from '../../assets/js/modules/error-types.js';

describe('Error Types', () => {
  describe('VocabularyError', () => {
    it('should create a basic vocabulary error', () => {
      const error = new VocabularyError('Test error', ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(VocabularyError);
      expect(error.message).toBe('Test error');
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.name).toBe('VocabularyError');
    });

    it('should create error with code and context', () => {
      const context = { field: 'test', value: 'invalid' };
      const error = new VocabularyError(
        'Validation failed',
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        'VALIDATION_ERROR',
        context
      );
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.context).toEqual(context);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should serialize to JSON correctly', () => {
      const error = new VocabularyError(
        'Test error',
        ErrorCategory.NETWORK,
        ErrorSeverity.LOW,
        'NETWORK_ERROR',
        { url: 'test.com' }
      );
      
      const json = error.toJSON();
      
      expect(json.name).toBe('VocabularyError');
      expect(json.message).toBe('Test error');
      expect(json.category).toBe('network');
      expect(json.severity).toBe('low');
      expect(json.code).toBe('NETWORK_ERROR');
      expect(json.context).toEqual({ url: 'test.com' });
      expect(json.timestamp).toBe(error.timestamp.toISOString());
    });

    it('should determine retryability correctly', () => {
      const retryableError = new NetworkError('Connection timeout', undefined, 'test.com');
      const nonRetryableError = new ValidationError('Invalid input', 'field', 'value');
      
      expect(retryableError.retryable).toBe(true);
      expect(nonRetryableError.retryable).toBe(false);
    });

    it('should provide user-friendly messages', () => {
      const networkError = new NetworkError('Connection failed', undefined, 'test.com');
      const validationError = new ValidationError('Invalid field', 'field', 'value');
      
      expect(networkError.userMessage).toBe('Network connection failed. Please check your internet connection and try again.');
      expect(validationError.userMessage).toBe('The provided data is invalid. Please check your input and try again.');
    });
  });

  describe('NetworkError', () => {
    it('should create network error with status code', () => {
      const error = new NetworkError('Request failed', 404, 'test.com');
      
      expect(error).toBeInstanceOf(VocabularyError);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.statusCode).toBe(404);
      expect(error.url).toBe('test.com');
    });

    it('should determine retryability based on status code', () => {
      const retryableError = new NetworkError('Timeout', undefined, 'test.com');
      const nonRetryableError = new NetworkError('Not found', 404, 'test.com');
      
      expect(retryableError.retryable).toBe(true);
      expect(nonRetryableError.retryable).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field details', () => {
      const error = new ValidationError('Invalid value', 'username', 'invalid@123');
      
      expect(error).toBeInstanceOf(VocabularyError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.field).toBe('username');
      expect(error.value).toBe('invalid@123');
    });
  });

  describe('StorageError', () => {
    it('should create storage error with operation details', () => {
      const error = new StorageError('Storage quota exceeded', 'write', 'test-key', 1000, 2000);
      
      expect(error).toBeInstanceOf(VocabularyError);
      expect(error).toBeInstanceOf(StorageError);
      expect(error.category).toBe(ErrorCategory.STORAGE);
      expect(error.operation).toBe('write');
      expect(error.key).toBe('test-key');
      expect(error.availableSpace).toBe(1000);
      expect(error.requiredSpace).toBe(2000);
    });
  });

  describe('ParsingError', () => {
    it('should create parsing error with format details', () => {
      const error = new ParsingError('Invalid JSON', 'JSON', '{"invalid": json}', 'valid JSON object');
      
      expect(error).toBeInstanceOf(VocabularyError);
      expect(error).toBeInstanceOf(ParsingError);
      expect(error.category).toBe(ErrorCategory.PARSING);
      expect(error.format).toBe('JSON');
      expect(error.invalidData).toBe('{"invalid": json}');
      expect(error.expectedFormat).toBe('valid JSON object');
    });
  });

  describe('SystemError', () => {
    it('should create system error with component details', () => {
      const error = new SystemError('Component failed', 'vocabulary-api', 'loadData');
      
      expect(error).toBeInstanceOf(VocabularyError);
      expect(error).toBeInstanceOf(SystemError);
      expect(error.category).toBe(ErrorCategory.SYSTEM);
      expect(error.component).toBe('vocabulary-api');
      expect(error.operation).toBe('loadData');
    });
  });

  describe('ErrorFactory', () => {
    it('should create error from generic Error', () => {
      const originalError = new Error('Original error message');
      const vocabError = ErrorFactory.fromError(originalError);
      
      expect(vocabError).toBeInstanceOf(VocabularyError);
      expect(vocabError.message).toBe('Original error message');
      expect(vocabError.category).toBe(ErrorCategory.SYSTEM);
      expect(vocabError.originalError).toBe(originalError);
    });

    it('should create error from VocabularyError', () => {
      const originalError = new NetworkError('Network failed', 500, 'test.com');
      const vocabError = ErrorFactory.fromError(originalError);
      
      expect(vocabError).toBe(originalError);
    });

    it('should create error with context', () => {
      const originalError = new Error('Test error');
      const context = { operation: 'test', url: 'test.com' };
      const vocabError = ErrorFactory.fromError(originalError, context);
      
      expect(vocabError.context).toEqual(context);
    });

    it('should create network error', () => {
      const error = ErrorFactory.network('Connection failed', 500, 'test.com');
      
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.url).toBe('test.com');
    });

    it('should create validation error', () => {
      const error = ErrorFactory.validation('Invalid input', 'field', 'value');
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBe('field');
      expect(error.value).toBe('value');
    });

    it('should create storage error', () => {
      const error = ErrorFactory.storage('Quota exceeded', 'write', 'key');
      
      expect(error).toBeInstanceOf(StorageError);
      expect(error.message).toBe('Quota exceeded');
      expect(error.operation).toBe('write');
      expect(error.key).toBe('key');
    });

    it('should create parsing error', () => {
      const error = ErrorFactory.parsing('Invalid JSON', 'JSON', '{"invalid"}', 'valid JSON');
      
      expect(error).toBeInstanceOf(ParsingError);
      expect(error.message).toBe('Invalid JSON');
      expect(error.format).toBe('JSON');
    });

    it('should create system error', () => {
      const error = ErrorFactory.system('Component failed', 'api', 'load');
      
      expect(error).toBeInstanceOf(SystemError);
      expect(error.message).toBe('Component failed');
      expect(error.component).toBe('api');
      expect(error.operation).toBe('load');
    });
  });

  describe('RetryStrategy', () => {
    it('should create retry strategy with default parameters', () => {
      const strategy = new RetryStrategy();
      
      expect(strategy.maxRetries).toBe(3);
      expect(strategy.baseDelay).toBe(1000);
      expect(strategy.maxDelay).toBe(10000);
    });

    it('should create retry strategy with custom parameters', () => {
      const strategy = new RetryStrategy(5, 500, 5000);
      
      expect(strategy.maxRetries).toBe(5);
      expect(strategy.baseDelay).toBe(500);
      expect(strategy.maxDelay).toBe(5000);
    });

    it('should calculate delay with exponential backoff', async () => {
      const strategy = new RetryStrategy(3, 100, 1000);
      
      const delay1 = strategy.calculateDelay(1);
      const delay2 = strategy.calculateDelay(2);
      const delay3 = strategy.calculateDelay(3);
      
      expect(delay1).toBeGreaterThanOrEqual(100);
      expect(delay1).toBeLessThanOrEqual(200);
      expect(delay2).toBeGreaterThanOrEqual(200);
      expect(delay2).toBeLessThanOrEqual(400);
      expect(delay3).toBeGreaterThanOrEqual(400);
      expect(delay3).toBeLessThanOrEqual(800);
    });

    it('should not exceed max delay', async () => {
      const strategy = new RetryStrategy(10, 1000, 2000);
      
      const delay = strategy.calculateDelay(10);
      expect(delay).toBeLessThanOrEqual(2000);
    });

    it('should execute retry function successfully', async () => {
      const strategy = new RetryStrategy(3, 100, 1000);
      let attempts = 0;
      
      const result = await strategy.recover(
        new Error('Should not be thrown'),
        {
          retryFunction: async () => {
            attempts++;
            if (attempts < 2) {
              throw new Error('Temporary failure');
            }
            return 'success';
          }
        }
      );
      
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should retry on failure and throw after max retries', async () => {
      const strategy = new RetryStrategy(2, 50, 100);
      let attempts = 0;
      
      await expect(strategy.recover(
        new Error('Should be thrown after retries'),
        {
          retryFunction: async () => {
            attempts++;
            throw new Error(`Attempt ${attempts} failed`);
          }
        }
      )).rejects.toThrow('Attempt 2 failed');
      
      expect(attempts).toBe(2);
    });

    it('should respect retry condition', async () => {
      const strategy = new RetryStrategy(3, 100, 1000);
      let attempts = 0;
      
      const result = await strategy.recover(
        new Error('Should not be thrown'),
        {
          retryFunction: async () => {
            attempts++;
            if (attempts < 2) {
              const error = new Error(`Attempt ${attempts} failed`);
              throw error;
            }
            return 'success';
          },
          shouldRetry: (error: Error) => error.message.includes('Attempt 1')
        }
      );
      
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should execute onRetry callback', async () => {
      const strategy = new RetryStrategy(3, 50, 100);
      let attempts = 0;
      const retryCallbacks: number[] = [];
      
      await strategy.recover(
        new Error('Should be thrown after retries'),
        {
          retryFunction: async () => {
            attempts++;
            throw new Error(`Attempt ${attempts} failed`);
          },
          onRetry: (attempt: number, error: Error) => {
            retryCallbacks.push(attempt);
          }
        }
      ).catch(() => {});
      
      expect(retryCallbacks).toEqual([1, 2, 3]);
    });
  });

  describe('Error Categories and Severities', () => {
    it('should have correct error categories', () => {
      expect(ErrorCategory.NETWORK).toBe('network');
      expect(ErrorCategory.VALIDATION).toBe('validation');
      expect(ErrorCategory.STORAGE).toBe('storage');
      expect(ErrorCategory.PARSING).toBe('parsing');
      expect(ErrorCategory.SYSTEM).toBe('system');
    });

    it('should have correct error severities', () => {
      expect(ErrorSeverity.LOW).toBe('low');
      expect(ErrorSeverity.MEDIUM).toBe('medium');
      expect(ErrorSeverity.HIGH).toBe('high');
      expect(ErrorSeverity.CRITICAL).toBe('critical');
    });
  });
});