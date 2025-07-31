/**
 * Tests for ConfigurationPanel component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ConfigurationPanel, useConfigurationPanel } from './ConfigurationPanel';
import { ConfigControl, ConfigurationPanelProps } from './types';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('ConfigurationPanel', () => {
  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleControls: ConfigControl[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'Default Title',
      group: 'Content',
      isContent: true,
    },
    {
      name: 'showBorder',
      type: 'boolean',
      label: 'Show Border',
      defaultValue: true,
      group: 'Appearance',
    },
    {
      name: 'size',
      type: 'select',
      label: 'Size',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      group: 'Appearance',
    },
    {
      name: 'padding',
      type: 'padding',
      label: 'Padding',
      defaultValue: { top: 16, right: 16, bottom: 16, left: 16 },
      group: 'Layout',
    },
  ];

  const defaultProps: ConfigurationPanelProps = {
    source: {
      type: 'controls',
      controls: sampleControls,
    },
    values: {
      title: 'Test Title',
      showBorder: true,
      size: 'medium',
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    },
    onChange: mockOnChange,
    updateMode: 'batched',
  };

  describe('Basic Rendering', () => {
    it('renders the configuration panel', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Configuration')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders custom title', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} title="Custom Configuration" />
        </TestWrapper>
      );

      expect(screen.getByText('Custom Configuration')).toBeInTheDocument();
    });

    it('renders all control types', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Show Border')).toBeInTheDocument();
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('Interaction Modes', () => {
    it('handles immediate mode updates', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} updateMode="immediate" />
        </TestWrapper>
      );

      const titleInput = screen.getByDisplayValue('Test Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      // In immediate mode, onChange should be called immediately
      waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('title', 'Updated Title');
      });
    });

    it('handles batched mode updates', async () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} updateMode="batched" />
        </TestWrapper>
      );

      const titleInput = screen.getByDisplayValue('Test Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      // In batched mode, onChange should not be called immediately
      expect(mockOnChange).not.toHaveBeenCalled();

      // Update button should appear after changes
      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument();
      });

      // Click update button
      fireEvent.click(screen.getByText('Update'));

      expect(mockOnChange).toHaveBeenCalledWith('title', 'Updated Title');
    });

    it('handles explicit mode with save callback', async () => {
      render(
        <TestWrapper>
          <ConfigurationPanel 
            {...defaultProps} 
            updateMode="explicit" 
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      const titleInput = screen.getByDisplayValue('Test Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Save'));

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
        })
      );
    });
  });

  describe('Control Types', () => {
    it('handles text input changes', async () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByDisplayValue('Test Title');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument();
      });
    });

    it('handles boolean switch changes', async () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} />
        </TestWrapper>
      );

      const switchInput = screen.getByLabelText('Show Border');
      fireEvent.click(switchInput);

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument();
      });
    });

    it('handles select option changes', async () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} />
        </TestWrapper>
      );

      const largeOption = screen.getByText('Large');
      fireEvent.click(largeOption);

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('shows update and cancel buttons when changes are made', async () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByDisplayValue('Test Title');
      fireEvent.change(titleInput, { target: { value: 'Changed' } });

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    it('shows reset button when no changes are made', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('handles cancel action', async () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} onCancel={mockOnCancel} />
        </TestWrapper>
      );

      const titleInput = screen.getByDisplayValue('Test Title');
      fireEvent.change(titleInput, { target: { value: 'Changed' } });

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalled();
      // Title should revert to original value
      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    });

    it('handles reset action', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} onReset={mockOnReset} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Reset'));

      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Grouped Accordions', () => {
    it('renders grouped accordions when enabled', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} showGroupedAccordions={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Layout')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} compactMode={true} />
        </TestWrapper>
      );

      // Should still render but with different spacing/sizing
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });
  });

  describe('Hide Actions', () => {
    it('hides action buttons when hideActions is true', () => {
      render(
        <TestWrapper>
          <ConfigurationPanel {...defaultProps} hideActions={true} />
        </TestWrapper>
      );

      expect(screen.queryByText('Update')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });
  });
});

describe('useConfigurationPanel hook', () => {
  const hookTestControls: ConfigControl[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'Default Title',
      group: 'Content',
      isContent: true,
    },
    {
      name: 'showBorder',
      type: 'boolean',
      label: 'Show Border',
      defaultValue: true,
      group: 'Appearance',
    },
    {
      name: 'size',
      type: 'select',
      label: 'Size',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      group: 'Appearance',
    },
    {
      name: 'padding',
      type: 'padding',
      label: 'Padding',
      defaultValue: { top: 16, right: 16, bottom: 16, left: 16 },
      group: 'Layout',
    },
  ];

  const TestComponent: React.FC<ConfigurationPanelProps> = (props) => {
    const { state, actions, groups, controls } = useConfigurationPanel(props);
    
    return (
      <div>
        <div data-testid="has-changes">{state.hasChanges.toString()}</div>
        <div data-testid="errors">{JSON.stringify(state.errors)}</div>
        <div data-testid="groups-count">{groups.length}</div>
        <div data-testid="controls-count">{controls.length}</div>
        <button onClick={() => actions.handleChange('title', 'New Title')}>
          Change Title
        </button>
        <button onClick={actions.handleSave}>Save</button>
        <button onClick={actions.handleCancel}>Cancel</button>
        <button onClick={actions.handleReset}>Reset</button>
      </div>
    );
  };

  it('manages state correctly', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TestComponent
        source={{
          type: 'controls',
          controls: hookTestControls,
        }}
        values={{ title: 'Test' }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('has-changes')).toHaveTextContent('false');
    expect(screen.getByTestId('errors')).toHaveTextContent('{}');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('3');
    expect(screen.getByTestId('controls-count')).toHaveTextContent('4');
  });

  it('handles changes correctly', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TestComponent
        source={{
          type: 'controls',
          controls: hookTestControls,
        }}
        values={{ title: 'Test' }}
        onChange={mockOnChange}
        updateMode="immediate"
      />
    );

    fireEvent.click(screen.getByText('Change Title'));

    expect(mockOnChange).toHaveBeenCalledWith('title', 'New Title');
  });
});