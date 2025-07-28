import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIDesignThemeProvider } from '../providers/AIDesignThemeProvider';
import { SubComponentWrapper } from '../components/AIDesignMode/SubComponentWrapper';
import { PatternWrapper } from '../components/AIDesignMode/PatternWrapper';
import { LabelValuePair } from '../patterns/pending/LabelValuePair';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the AI Design Mode context
const mockSetSelectedPattern = vi.fn();
const mockSetSelectedInstanceId = vi.fn();

vi.mock('../contexts/AIDesignModeContext', () => ({
  useAIDesignMode: () => ({
    isEnabled: true,
    selectedPattern: null,
    setSelectedPattern: mockSetSelectedPattern,
    selectedInstanceId: null,
    setSelectedInstanceId: mockSetSelectedInstanceId,
    updatePatternInstance: vi.fn(),
    updateAllPatternInstances: vi.fn(),
    getPatternInstances: vi.fn(() => []),
    findPatternInstanceById: vi.fn(),
  }),
  AIDesignModeContext: React.createContext({}),
  AIDesignModeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Component Selection and Props Population', () => {
  const theme = createTheme();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pattern Selection', () => {
    it('should populate pattern props when clicking on a pattern', async () => {
      const patternProps = {
        title: 'Test Card',
        subtitle: 'Test Description',
        showHeader: true,
        elevation: 2,
      };

      render(
        <ThemeProvider theme={theme}>
          <AIDesignThemeProvider theme={theme}>
            <div
              data-pattern-name="DataDisplayCard"
              data-pattern-status="pending"
              data-pattern-category="cards"
              data-pattern-instance="test-123"
              data-pattern-props={JSON.stringify(patternProps)}
              data-testid="test-pattern"
            >
              Test Pattern
            </div>
          </AIDesignThemeProvider>
        </ThemeProvider>
      );

      const pattern = screen.getByTestId('test-pattern');
      fireEvent.click(pattern);

      await waitFor(() => {
        expect(mockSetSelectedPattern).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'DataDisplayCard',
            status: 'pending',
            category: 'cards',
            instanceId: 'test-123',
            props: patternProps,
          })
        );
      });
    });
  });

  describe('Sub-Component Selection', () => {
    it('should populate sub-component props when clicking on a sub-component', async () => {
      const subComponentProps = {
        label: 'Status',
        value: 'Active',
        variant: 'inline',
        valueColor: 'success',
      };

      render(
        <ThemeProvider theme={theme}>
          <AIDesignThemeProvider theme={theme}>
            <PatternWrapper patternName="TestPattern" status="pending" category="test">
              <SubComponentWrapper
                componentName="status"
                componentType="LabelValuePair"
                componentProps={subComponentProps}
              >
                <LabelValuePair {...subComponentProps} />
              </SubComponentWrapper>
            </PatternWrapper>
          </AIDesignThemeProvider>
        </ThemeProvider>
      );

      // Find the sub-component by its data attribute
      const subComponent = document.querySelector('[data-subcomponent-type="LabelValuePair"]');
      expect(subComponent).toBeTruthy();

      if (subComponent) {
        fireEvent.click(subComponent);

        await waitFor(() => {
          expect(mockSetSelectedPattern).toHaveBeenCalledWith(
            expect.objectContaining({
              name: 'status',
              category: 'LabelValuePair',
              props: subComponentProps,
              isSubComponent: true,
            })
          );
        });
      }
    });

    it('should store props in data attributes correctly', () => {
      const subComponentProps = {
        label: 'Test Label',
        value: 'Test Value',
        showLabel: true,
      };

      render(
        <ThemeProvider theme={theme}>
          <AIDesignThemeProvider theme={theme}>
            <SubComponentWrapper
              componentName="test"
              componentType="LabelValuePair"
              componentProps={subComponentProps}
            >
              <div>Test Content</div>
            </SubComponentWrapper>
          </AIDesignThemeProvider>
        </ThemeProvider>
      );

      const element = document.querySelector('[data-subcomponent-id]');
      expect(element).toBeTruthy();

      if (element) {
        const propsAttr = element.getAttribute('data-subcomponent-props');
        expect(propsAttr).toBeTruthy();

        if (propsAttr) {
          const parsedProps = JSON.parse(propsAttr);
          expect(parsedProps).toEqual(subComponentProps);
        }
      }
    });
  });

  describe('Props Update', () => {
    it('should update component props when values change', async () => {
      const initialProps = {
        label: 'Initial',
        value: 'Value',
      };

      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <AIDesignThemeProvider theme={theme}>
            <SubComponentWrapper
              componentName="test"
              componentType="LabelValuePair"
              componentProps={initialProps}
            >
              <div>Test</div>
            </SubComponentWrapper>
          </AIDesignThemeProvider>
        </ThemeProvider>
      );

      const element = document.querySelector('[data-subcomponent-props]');
      const propsAttr = element?.getAttribute('data-subcomponent-props');
      expect(JSON.parse(propsAttr || '{}')).toEqual(initialProps);

      // Update props
      const updatedProps = {
        label: 'Updated',
        value: 'New Value',
      };

      rerender(
        <ThemeProvider theme={theme}>
          <AIDesignThemeProvider theme={theme}>
            <SubComponentWrapper
              componentName="test"
              componentType="LabelValuePair"
              componentProps={updatedProps}
            >
              <div>Test</div>
            </SubComponentWrapper>
          </AIDesignThemeProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        const updatedElement = document.querySelector('[data-subcomponent-props]');
        const updatedPropsAttr = updatedElement?.getAttribute('data-subcomponent-props');
        expect(JSON.parse(updatedPropsAttr || '{}')).toEqual(updatedProps);
      });
    });
  });
});
