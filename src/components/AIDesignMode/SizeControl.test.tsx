import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SizeControl, SizeValue } from './SizeControl';

describe('SizeControl', () => {
  const defaultProps = {
    label: 'Width',
    value: { mode: 'auto' as const },
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label', () => {
    render(<SizeControl {...defaultProps} />);
    expect(screen.getByText(/Width:/)).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SizeControl {...defaultProps} />);
    expect(screen.getByText('auto')).toBeInTheDocument();
  });

  it('should display helper text when provided', () => {
    render(<SizeControl {...defaultProps} helperText="Set the width of the component" />);
    expect(screen.getByText('Set the width of the component')).toBeInTheDocument();
  });

  it('should render all mode buttons', () => {
    render(<SizeControl {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Auto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '100%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
  });

  it('should change mode when button is clicked', () => {
    render(<SizeControl {...defaultProps} />);

    const customButton = screen.getByRole('button', { name: 'Custom' });
    fireEvent.click(customButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      mode: 'custom',
      customValue: 300,
      unit: 'px',
    });
  });

  it('should show slider and input when in custom mode', () => {
    const customValue: SizeValue = {
      mode: 'custom',
      customValue: 500,
      unit: 'px',
    };

    render(<SizeControl {...defaultProps} value={customValue} />);

    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('should not show slider and input when not in custom mode', () => {
    render(<SizeControl {...defaultProps} />);

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('should update value when slider changes', () => {
    const customValue: SizeValue = {
      mode: 'custom',
      customValue: 500,
      unit: 'px',
    };

    render(<SizeControl {...defaultProps} value={customValue} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 600 } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      mode: 'custom',
      customValue: 600,
      unit: 'px',
    });
  });

  it('should update value when input changes', () => {
    const customValue: SizeValue = {
      mode: 'custom',
      customValue: 500,
      unit: 'px',
    };

    render(<SizeControl {...defaultProps} value={customValue} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '750' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      mode: 'custom',
      customValue: 750,
      unit: 'px',
    });
  });

  it('should clamp values to min/max', () => {
    const customValue: SizeValue = {
      mode: 'custom',
      customValue: 500,
      unit: 'px',
    };

    render(<SizeControl {...defaultProps} value={customValue} min={100} max={800} />);

    const input = screen.getByRole('spinbutton');

    // Test max clamping
    fireEvent.change(input, { target: { value: '1000' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      mode: 'custom',
      customValue: 800,
      unit: 'px',
    });

    // Test min clamping
    fireEvent.change(input, { target: { value: '50' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      mode: 'custom',
      customValue: 100,
      unit: 'px',
    });
  });

  it('should display custom value with unit', () => {
    const customValue: SizeValue = {
      mode: 'custom',
      customValue: 250,
      unit: '%',
    };

    render(<SizeControl {...defaultProps} value={customValue} />);
    expect(screen.getByText('250%')).toBeInTheDocument();
  });

  it('should preserve existing custom value when switching to custom mode', () => {
    const value: SizeValue = {
      mode: 'auto',
      customValue: 600,
      unit: 'px',
    };

    render(<SizeControl {...defaultProps} value={value} />);

    const customButton = screen.getByRole('button', { name: 'Custom' });
    fireEvent.click(customButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      mode: 'custom',
      customValue: 600,
      unit: 'px',
    });
  });

  it('should handle invalid input gracefully', () => {
    const customValue: SizeValue = {
      mode: 'custom',
      customValue: 500,
      unit: 'px',
    };

    render(<SizeControl {...defaultProps} value={customValue} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: 'invalid' } });

    // onChange should not be called with invalid input
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('should use default min/max/step values', () => {
    const customValue: SizeValue = {
      mode: 'custom',
      customValue: 500,
      unit: 'px',
    };

    render(<SizeControl {...defaultProps} value={customValue} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '1000');
  });
});
