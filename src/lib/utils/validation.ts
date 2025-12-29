/**
 * Validation utilities for vocabulary editor
 */

interface ExampleItem {
  german: string;
  bulgarian: string;
  context: string;
}

export interface FormDataForValidation {
  german: string;
  bulgarian: string;
  examples: ExampleItem[];
}

export function validateVocabularyForm(input: Omit<FormDataForValidation, 'examples'> & { examples: ExampleItem[] }): Record<string, string> {
  const errors: Record<string, string> = {};

  // Access properties using bracket notation to avoid index signature issues
  const germanVal = (input['german'] as string).trim();
  if (!germanVal) {
    errors['german'] = 'German word is required';
  }

  const bulgarianVal = (input['bulgarian'] as string).trim();
  if (!bulgarianVal) {
    errors['bulgarian'] = 'Bulgarian word is required';
  }

  const examplesVal = input['examples'] as ExampleItem[];
  if (examplesVal.some((ex) => !ex.german.trim() && !ex.bulgarian.trim())) {
    errors['examples'] = 'All example fields must be filled';
  }

  return errors;
}
