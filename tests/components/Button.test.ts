import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ButtonWrapper from './ButtonWrapper.test.svelte';

describe('Button Component', () => {
	it('should render with default props', () => {
		render(ButtonWrapper, { buttonText: 'Click Me' });
		const button = screen.getByText('Click Me');
		expect(button).toBeInTheDocument();
		expect(button.tagName).toBe('BUTTON');
	});

	it('should apply variant classes', () => {
		render(ButtonWrapper, { variant: 'default', buttonText: 'Primary' });
		const button = screen.getByText('Primary');
		expect(button).toHaveClass('bg-primary');
		expect(button).toHaveClass('text-primary-foreground');
	});

	it('should apply size classes', () => {
		render(ButtonWrapper, { size: 'lg', buttonText: 'Large' });
		const button = screen.getByText('Large');
		expect(button).toHaveClass('h-11');
	});

	it('should pass additional props', () => {
		render(ButtonWrapper, { disabled: true, buttonText: 'Disabled' });
		const button = screen.getByText('Disabled');
		expect(button).toBeDisabled();
	});
});