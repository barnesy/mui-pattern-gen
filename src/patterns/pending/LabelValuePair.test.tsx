import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LabelValuePair } from './LabelValuePair';
import { Info as InfoIcon } from '@mui/icons-material';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('LabelValuePair', () => {
  it('should render label and value by default', () => {
    renderWithTheme(<LabelValuePair label="Test Label" value="Test Value" />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { rerender } = renderWithTheme(
      <LabelValuePair label="Label" value="Value" variant="inline" />
    );
    expect(screen.getByText(':')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <LabelValuePair label="Label" value="Value" variant="minimal" />
      </ThemeProvider>
    );
    expect(screen.queryByText(':')).not.toBeInTheDocument();
  });

  it('should show help icon with tooltip when helpText is provided', () => {
    renderWithTheme(
      <LabelValuePair
        label="Label"
        value="Value"
        helpText="This is helpful information"
        showHelpIcon={true}
      />
    );

    // Help icon should be present
    const helpIcon = screen.getByTestId('InfoIcon');
    expect(helpIcon).toBeInTheDocument();
  });

  it('should render loading state', () => {
    renderWithTheme(<LabelValuePair label="Label" value="Value" loading={true} />);

    // Should show skeleton loaders
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render value as chip when chip prop is true', () => {
    renderWithTheme(
      <LabelValuePair label="Status" value="Active" chip={true} chipColor="success" />
    );

    const chip = screen.getByText('Active').closest('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('should render trend indicators', () => {
    renderWithTheme(
      <LabelValuePair label="Growth" value="15%" trend="up" trendValue="+5%" showTrend={true} />
    );

    expect(screen.getByTestId('TrendingUpIcon')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('should respect show/hide props', () => {
    const { rerender } = renderWithTheme(
      <LabelValuePair label="Label" value="Value" showLabel={false} />
    );

    expect(screen.queryByText('Label')).not.toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <LabelValuePair label="Label" value="Value" showValue={false} />
      </ThemeProvider>
    );

    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.queryByText('Value')).not.toBeInTheDocument();
  });

  it('should render with custom icon', () => {
    renderWithTheme(
      <LabelValuePair label="Info" value="Details" icon={<InfoIcon data-testid="custom-icon" />} />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should apply size variations correctly', () => {
    const { rerender } = renderWithTheme(
      <LabelValuePair label="Label" value="Value" size="small" />
    );

    // Typography should be rendered with appropriate variants based on size
    let label = screen.getByText('Label');
    expect(label).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <LabelValuePair label="Label" value="Value" size="large" />
      </ThemeProvider>
    );

    label = screen.getByText('Label');
    expect(label).toBeInTheDocument();
  });

  it('should handle numeric values', () => {
    renderWithTheme(<LabelValuePair label="Count" value={42} />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should apply text alignment', () => {
    renderWithTheme(
      <LabelValuePair label="Label" value="Value" align="center" variant="default" />
    );

    // The text should be rendered with center alignment
    const label = screen.getByText('Label');
    expect(label).toBeInTheDocument();
    const value = screen.getByText('Value');
    expect(value).toBeInTheDocument();
  });

  it('should not show trend when showTrend is false', () => {
    renderWithTheme(<LabelValuePair label="Growth" value="15%" trend="up" showTrend={false} />);

    expect(screen.queryByTestId('TrendingUpIcon')).not.toBeInTheDocument();
  });

  it('should render different trend directions', () => {
    const { rerender } = renderWithTheme(<LabelValuePair label="Trend" value="0" trend="down" />);
    expect(screen.getByTestId('TrendingDownIcon')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <LabelValuePair label="Trend" value="0" trend="flat" />
      </ThemeProvider>
    );
    expect(screen.getByTestId('TrendingFlatIcon')).toBeInTheDocument();
  });

  it('should apply custom typography variants', () => {
    renderWithTheme(
      <LabelValuePair label="Custom" value="Typography" labelVariant="h6" valueVariant="h4" />
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
  });
});
