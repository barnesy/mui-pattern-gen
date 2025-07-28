import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SpacingControl } from './SpacingControl';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('SpacingControl', () => {
  const defaultProps = {
    label: 'Test Spacing',
    value: { top: 2, right: 2, bottom: 2, left: 2 },
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);
    expect(screen.getByText('Test Spacing')).toBeInTheDocument();
  });

  it('should display helper text when provided', () => {
    renderWithTheme(<SpacingControl {...defaultProps} helperText="This is helper text" />);
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should display all spacing values', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    // Check that spacing values are displayed in the visualization
    const valueElements = screen.getAllByText('2');
    expect(valueElements.length).toBeGreaterThanOrEqual(4); // At least 4 values shown
  });

  it('should render input fields for all sides', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(4);

    // Check that each input has the correct value
    inputs.forEach((input) => {
      expect(input).toHaveValue(2);
    });
  });

  it('should call onChange when individual side value changes', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const topInput = inputs[0];

    fireEvent.change(topInput, { target: { value: '5' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: 5,
      right: 2,
      bottom: 2,
      left: 2,
    });
  });

  it('should limit values between 0 and 10', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const topInput = inputs[0];

    // Test max limit
    fireEvent.change(topInput, { target: { value: '15' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: 10,
      right: 2,
      bottom: 2,
      left: 2,
    });

    // Test min limit
    fireEvent.change(topInput, { target: { value: '-5' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: 0,
      right: 2,
      bottom: 2,
      left: 2,
    });
  });

  it('should handle linked mode when toggled', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    const linkButton = screen.getByRole('button', { pressed: false });
    fireEvent.click(linkButton);

    // Should set all values to top value
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: 2,
      right: 2,
      bottom: 2,
      left: 2,
    });
  });

  it('should update all sides when in linked mode', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    // Enable linked mode
    const linkButton = screen.getByRole('button', { pressed: false });
    fireEvent.click(linkButton);

    // Clear previous calls
    vi.clearAllMocks();

    // Change one value
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '4' } });

    // All sides should update
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: 4,
      right: 4,
      bottom: 4,
      left: 4,
    });
  });

  it('should display correct color based on type', () => {
    const { rerender } = renderWithTheme(<SpacingControl {...defaultProps} type="margin" />);

    let typeText = screen.getByText('margin');
    expect(typeText).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <SpacingControl {...defaultProps} type="padding" />
      </ThemeProvider>
    );

    typeText = screen.getByText('padding');
    expect(typeText).toBeInTheDocument();
  });

  it('should handle empty string input as 0', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: 0,
      right: 2,
      bottom: 2,
      left: 2,
    });
  });

  it('should display side icons correctly', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    // Check for side labels (T, R, B, L)
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('should visualize spacing correctly', () => {
    renderWithTheme(<SpacingControl {...defaultProps} />);

    // The visualization box should exist
    const visualBox = screen.getByText(defaultProps.type || 'margin').parentElement;
    expect(visualBox).toBeInTheDocument();

    // Check that the box has the correct styles applied
    const computedStyle = window.getComputedStyle(visualBox!);
    expect(computedStyle.top).toBe('16px'); // 2 * 8px
    expect(computedStyle.right).toBe('16px');
    expect(computedStyle.bottom).toBe('16px');
    expect(computedStyle.left).toBe('16px');
  });
});
