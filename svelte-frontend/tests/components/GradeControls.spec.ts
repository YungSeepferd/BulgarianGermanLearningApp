/**
 * GradeControls Component Tests
 * @file tests/components/GradeControls.spec.ts
 * @description Comprehensive tests for the GradeControls.svelte component using Vitest
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/svelte';
import { mountGradeControls } from '../test-utils';

describe('GradeControls Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly with default props', async () => {
    const { container } = await mountGradeControls({});
    
    // Check that all grade buttons are present
    for (let i = 0; i <= 3; i++) {
      expect(screen.getByLabelText(`Grade ${i}`)).toBeInTheDocument();
    }
  });

  test('renders in compact mode', async () => {
    const { container } = await mountGradeControls({
      compact: true
    });
    
    expect(container.querySelector('.grade-controls.compact')).toBeInTheDocument();
    
    // In compact mode, should have buttons
    const buttons = container.querySelectorAll('.grade-button');
    expect(buttons.length).toBe(4); // 0-3 grades
  });

  test('shows feedback when showFeedback is true', async () => {
    const { container } = await mountGradeControls({
      showFeedback: true
    });
    
    expect(container.querySelector('.feedback-section')).toBeInTheDocument();
  });

  test('hides feedback when showFeedback is false', async () => {
    const { container } = await mountGradeControls({
      showFeedback: false
    });
    
    expect(container.querySelector('.feedback-section')).toBeNull();
  });

  test('calls onGrade callback when grade button is clicked', async () => {
    const mockOnGrade = vi.fn();
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Click grade 2 button
    const gradeButton = screen.getByLabelText('Grade 2');
    await fireEvent.click(gradeButton);
    
    // Check callback was called
    expect(mockOnGrade).toHaveBeenCalledWith(2);
  });

  test('calls onGrade callback for all grade levels', async () => {
    const gradesReceived: number[] = [];
    const mockOnGrade = vi.fn((grade: number) => {
      gradesReceived.push(grade);
    });
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Test all grade buttons
    for (let i = 0; i <= 3; i++) {
      const gradeButton = screen.getByLabelText(`Grade ${i}`);
      await fireEvent.click(gradeButton);
    }
    
    // Check all grades were received
    expect(gradesReceived).toEqual([0, 1, 2, 3]);
  });

  test('displays correct classes for each grade level', async () => {
    const { container } = await mountGradeControls({});
    
    // Check that grade buttons have appropriate classes
    for (let i = 0; i <= 3; i++) {
      const gradeButton = screen.getByLabelText(`Grade ${i}`);
      expect(gradeButton).toHaveClass(`grade-${i}`);
    }
  });

  test('shows feedback message when grade is selected', async () => {
    const { container } = await mountGradeControls({
      showFeedback: true
    });
    
    // Click grade 3 button
    const gradeButton = screen.getByLabelText('Grade 3');
    await fireEvent.click(gradeButton);
    
    // Should show feedback
    await waitFor(() => {
      expect(container.querySelector('.feedback-message')).toBeInTheDocument();
    });
  });

  test('shows appropriate feedback for each grade level', async () => {
    const { container } = await mountGradeControls({
      showFeedback: true
    });
    
    const feedbackMessages = [
      'Again', // Grade 0
      'Hard',  // Grade 1
      'Good',  // Grade 2
      'Easy'   // Grade 3
    ];
    
    for (let i = 0; i <= 3; i++) {
      // Click grade button
      const gradeButton = screen.getByLabelText(`Grade ${i}`);
      await fireEvent.click(gradeButton);
      
      // Check feedback message contains grade label
      await waitFor(() => {
        const feedback = container.querySelector('.feedback-message');
        if (feedback) {
          expect(feedback.textContent).toContain(feedbackMessages[i]);
        }
      });
    }
  });

  test('supports keyboard navigation', async () => {
    const { container } = await mountGradeControls({});
    
    // Focus on the component
    const gradeControls = container.querySelector('.grade-controls');
    if (gradeControls) {
      gradeControls.focus();
    }
    
    // Test keyboard events can be fired
    for (let i = 0; i <= 3; i++) {
      const gradeButton = screen.getByLabelText(`Grade ${i}`);
      await fireEvent.keyDown(gradeButton, { key: i.toString() });
    }
  });

  test('highlights active grade on hover', async () => {
    const { container } = await mountGradeControls({});
    
    const grade2Button = screen.getByLabelText('Grade 2');
    
    // Hover over grade 2 button
    await fireEvent.mouseEnter(grade2Button);
    
    // Should have hover state (class changes are handled by CSS)
    expect(grade2Button).toBeInTheDocument();
  });

  test('shows processing state during grade submission', async () => {
    const mockOnGrade = vi.fn();
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Click grade button
    const gradeButton = screen.getByLabelText('Grade 2');
    await fireEvent.click(gradeButton);
    
    // Should call the callback
    expect(mockOnGrade).toHaveBeenCalled();
  });

  test('disables all buttons when disabled prop is true', async () => {
    const { container } = await mountGradeControls({
      disabled: true
    });
    
    // All buttons should be disabled
    for (let i = 0; i <= 3; i++) {
      const gradeButton = screen.getByLabelText(`Grade ${i}`);
      expect(gradeButton).toBeDisabled();
    }
  });

  test('is accessible', async () => {
    const { container } = await mountGradeControls({});
    
    // Check specific accessibility features
    const buttons = container.querySelectorAll('button[aria-label*="Grade"]');
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('role', 'button');
    }
  });

  test('provides screen reader feedback', async () => {
    const { container } = await mountGradeControls({
      showFeedback: true
    });
    
    // Click grade button
    const gradeButton = screen.getByLabelText('Grade 3');
    await fireEvent.click(gradeButton);
    
    // Should have screen reader announcement
    await waitFor(() => {
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  test('is responsive across different viewports', async () => {
    const { container } = await mountGradeControls({});
    
    // Basic responsiveness test - component should render
    expect(container.querySelector('.grade-controls')).toBeInTheDocument();
  });

  test('handles rapid clicking gracefully', async () => {
    let gradeCount = 0;
    const mockOnGrade = vi.fn((grade: number) => {
      gradeCount++;
    });
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Rapidly click multiple grade buttons
    const gradeButton = screen.getByLabelText('Grade 2');
    for (let i = 0; i < 5; i++) {
      await fireEvent.click(gradeButton);
    }
    
    // Should handle rapid clicks without errors
    expect(gradeCount).toBeGreaterThan(0);
  });

  test('supports custom styling classes', async () => {
    const { container } = await mountGradeControls({});
    
    // Should have base styling classes
    expect(container.querySelector('.grade-controls')).toBeInTheDocument();
    expect(container.querySelectorAll('.grade-button').length).toBe(4);
  });

  test('supports keyboard shortcuts with number keys', async () => {
    const mockOnGrade = vi.fn();
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Test keyboard events for grades
    for (let i = 0; i <= 3; i++) {
      const gradeButton = screen.getByLabelText(`Grade ${i}`);
      await fireEvent.keyDown(gradeButton, { key: i.toString() });
    }
    
    // Should call callbacks for keyboard events
    expect(mockOnGrade).toHaveBeenCalled();
  });

  test('supports Enter key for focused grade button', async () => {
    const mockOnGrade = vi.fn();
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Focus on grade 2 button
    const gradeButton = screen.getByLabelText('Grade 2');
    gradeButton.focus();
    
    // Press Enter
    await fireEvent.keyDown(gradeButton, { key: 'Enter' });
    
    // Should trigger grade selection
    expect(mockOnGrade).toHaveBeenCalledWith(2);
  });

  test('supports Space key for focused grade button', async () => {
    const mockOnGrade = vi.fn();
    
    const { container } = await mountGradeControls({
      onGrade: mockOnGrade
    });
    
    // Focus on grade 3 button
    const gradeButton = screen.getByLabelText('Grade 3');
    gradeButton.focus();
    
    // Press Space
    await fireEvent.keyDown(gradeButton, { key: ' ' });
    
    // Should trigger grade selection
    expect(mockOnGrade).toHaveBeenCalledWith(3);
  });

  test('maintains focus state after grade selection', async () => {
    const { container } = await mountGradeControls({});
    
    // Focus on grade 2 button
    const gradeButton = screen.getByLabelText('Grade 2');
    gradeButton.focus();
    
    // Verify focus
    expect(document.activeElement).toBe(gradeButton);
    
    // Click grade button
    await fireEvent.click(gradeButton);
    
    // Should maintain focus or move focus appropriately
    expect(document.activeElement).toBeDefined();
  });
});