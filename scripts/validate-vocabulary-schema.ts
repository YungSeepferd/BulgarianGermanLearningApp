#!/usr/bin/env tsx
/**
 * Vocabulary Schema Validation Script
 * Validates all vocabulary data against Zod schemas
 * Used in CI/CD pipeline to catch schema violations
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { VocabularyIndexItemSchema } from '../src/lib/schemas/vocabulary-index';

interface ValidationResult {
	file: string;
	valid: boolean;
	errors: string[];
	itemCount: number;
}

const VOCABULARY_FILES = [
	'data/vocabulary/index.json',
	'static/data/vocabulary/index.json',
	'data/unified-vocabulary.json'
];

function validateFile(filePath: string): ValidationResult {
	const result: ValidationResult = {
		file: filePath,
		valid: true,
		errors: [],
		itemCount: 0
	};

	if (!existsSync(filePath)) {
		result.valid = false;
		result.errors.push(`File not found: ${filePath}`);
		return result;
	}

	try {
		const content = readFileSync(filePath, 'utf-8');
		const data = JSON.parse(content);

		// Handle both array and object formats
		const items = Array.isArray(data) ? data : data.items || [data];
		result.itemCount = items.length;

		// Validate each item
		for (let i = 0; i < items.length; i++) {
			try {
				VocabularyIndexItemSchema.parse(items[i]);
			} catch (error) {
				if (error instanceof Error) {
					result.errors.push(`Item ${i}: ${error.message}`);
					result.valid = false;
				}
			}
		}
	} catch (error) {
		result.valid = false;
		if (error instanceof Error) {
			result.errors.push(`Parse error: ${error.message}`);
		}
	}

	return result;
}

function main() {
	console.log('🔍 Vocabulary Schema Validation\n');
	console.log('='.repeat(60));

	let allValid = true;
	const results: ValidationResult[] = [];

	for (const file of VOCABULARY_FILES) {
		const result = validateFile(file);
		results.push(result);

		if (!result.valid) {
			allValid = false;
		}

		console.log(`\n📄 ${file}`);
		console.log(`   Items: ${result.itemCount}`);
		console.log(`   Status: ${result.valid ? '✅ Valid' : '❌ Invalid'}`);

		if (result.errors.length > 0) {
			console.log(`   Errors: ${result.errors.length}`);
			for (const error of result.errors.slice(0, 5)) {
				console.log(`     - ${error}`);
			}
			if (result.errors.length > 5) {
				console.log(`     ... and ${result.errors.length - 5} more errors`);
			}
		}
	}

	console.log('\n' + '='.repeat(60));

	if (allValid) {
		console.log('\n✅ All vocabulary files pass schema validation!\n');
		process.exit(0);
	} else {
		console.log('\n❌ Schema validation failed. Please fix the errors above.\n');
		process.exit(1);
	}
}

main();