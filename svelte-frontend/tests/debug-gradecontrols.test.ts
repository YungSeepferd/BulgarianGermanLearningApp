/**
 * Debug test for GradeControls component
 * This test helps diagnose why event handlers aren't being called
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/svelte';
import { mountGradeControls } from './test-utils';

describe('GradeControls Debug Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('debug - check if buttons have onclick handlers', async () => {
    const mockOnGrade = vi.fn().mockResolvedValue(undefined);
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Check if buttons exist
    const buttons = container!.querySelectorAll('.grade-button');
    expect(buttons.length).toBe(6);
    
    // Check if buttons have onclick attributes
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      console.log(`Button ${i}:`, {
        hasOnclick: button.hasAttribute('onclick'),
        onclickValue: button.getAttribute('onclick'),
        outerHTML: button.outerHTML
      });
    }
    
    // Try clicking a button directly
    const grade2Button = Array.from(buttons).find(button => 
      button.querySelector('.grade-number')?.textContent === '2'
    );
    
    if (grade2Button) {
      console.log('Grade 2 button found, attempting click...');
      
      // Check if button is clickable
      expect(grade2Button).not.toBeDisabled();
      
      // Try clicking
      await fireEvent.click(grade2Button);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Mock calls after click:', mockOnGrade.mock.calls);
      console.log('Mock call count:', mockOnGrade.mock.calls.length);
    }
  });

  test('debug - check component mounting', async () => {
    const { container } = await mountGradeControls({});
    
    // Check if component is properly mounted
    const gradeControls = container!.querySelector('.grade-controls');
    expect(gradeControls).toBeInTheDocument();
    
    // Check if buttons are interactive
    const buttons = container!.querySelectorAll('.grade-button');
    for (const button of buttons) {
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toBeDisabled();
    }
  });

  test('debug - check event handler binding', async () => {
    const mockOnGrade = vi.fn().mockResolvedValue(undefined);
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Check if the onGrade prop is properly passed
    const buttons = container!.querySelectorAll('.grade-button');
    const grade2Button = Array.from(buttons).find(button => 
      button.querySelector('.grade-number')?.textContent === '2'
    );
    
    if (grade2Button) {
      // Try multiple click methods
      console.log('Testing click methods...');
      
      // Method 1: fireEvent.click
      await fireEvent.click(grade2Button);
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('After fireEvent.click:', mockOnGrade.mock.calls.length);
      
      // Method 2: direct click
      (grade2Button as HTMLElement).click();
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('After direct click:', mockOnGrade.mock.calls.length);
      
      // Method 3: dispatch event
      grade2Button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('After dispatchEvent:', mockOnGrade.mock.calls.length);
    }
  });
});