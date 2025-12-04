import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DialogWrapper from './DialogWrapper.test.svelte';

describe('Dialog Component', () => {
  it('should render dialog trigger button', () => {
    render(DialogWrapper);

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should not show dialog content initially', () => {
    render(DialogWrapper);

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', async () => {
    render(DialogWrapper);

    await fireEvent.click(screen.getByText('Open Dialog'));

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', async () => {
    render(DialogWrapper);

    // Open dialog
    await fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    // Close dialog
    await fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should close dialog when Escape key is pressed', async () => {
    render(DialogWrapper);

    // Open dialog
    await fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    // Close with Escape key
    await fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should call onOpenChange when dialog opens and closes', async () => {
    const { component } = render(DialogWrapper);

    const mock = vi.fn();
    component.$on('openChange', mock);

    // Open dialog
    await fireEvent.click(screen.getByText('Open Dialog'));
    expect(mock).toHaveBeenCalledWith(expect.objectContaining({ detail: true }));

    // Close dialog
    await fireEvent.click(screen.getByText('Close'));
    expect(mock).toHaveBeenCalledWith(expect.objectContaining({ detail: false }));
  });

  it('should have proper accessibility attributes', () => {
    render(DialogWrapper);

    const trigger = screen.getByText('Open Dialog');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('should focus the close button when dialog opens', async () => {
    render(DialogWrapper);

    await fireEvent.click(screen.getByText('Open Dialog'));

    const closeButton = screen.getByText('Close');
    expect(document.activeElement).toBe(closeButton);
  });

  it('should restore focus to trigger when dialog closes', async () => {
    render(DialogWrapper);

    const trigger = screen.getByText('Open Dialog');
    await fireEvent.click(trigger);

    const closeButton = screen.getByText('Close');
    await fireEvent.click(closeButton);

    expect(document.activeElement).toBe(trigger);
  });

  it('should render in portal when portal prop is true', async () => {
    // Test with portal enabled
    const { container } = render(DialogWrapper, { portal: true });

    await fireEvent.click(screen.getByText('Open Dialog'));

    // Dialog should be rendered in portal (body)
    const dialogContent = screen.getByText('Dialog Content');
    expect(container.contains(dialogContent)).toBe(false);
    expect(document.body.contains(dialogContent)).toBe(true);
  });
});