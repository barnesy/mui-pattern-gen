import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock ReactDOM
vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  },
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock the App component
vi.mock('./App', () => ({
  default: () => <div>App Component</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  createBrowserRouter: vi.fn(() => ({})),
  RouterProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Outlet: () => <div>Outlet</div>,
}));

describe('main.tsx', () => {
  let rootElement: HTMLElement;

  beforeEach(() => {
    // Create a root element
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Clear module cache
    vi.resetModules();
  });

  afterEach(() => {
    // Clean up
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }
    vi.clearAllMocks();
  });

  it('creates root element and renders App', async () => {
    const ReactDOMDefault = (await import('react-dom/client')).default;
    const mockRender = vi.fn();
    const mockCreateRoot = ReactDOMDefault.createRoot as ReturnType<typeof vi.fn>;
    
    mockCreateRoot.mockReturnValue({
      render: mockRender,
    });

    // Import main.tsx to trigger execution
    await import('./main');

    // Check that createRoot was called with the root element
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);

    // Check that render was called
    expect(mockRender).toHaveBeenCalled();

    // Get the rendered component from the mock call
    const mockCalls = mockRender.mock.calls as Array<[React.ReactElement]>;
    const renderedComponent = mockCalls[0][0];

    // Render it to check structure
    const { container } = render(renderedComponent);
    
    // Should have App component
    expect(container.textContent).toContain('App Component');
  });

  it('handles missing root element gracefully', async () => {
    // Remove the root element if it exists
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }

    // Mock console.error to check if error is logged
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Should not throw when importing
    await expect(import('./main')).resolves.not.toThrow();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('renders in StrictMode', async () => {
    const ReactDOMDefault = (await import('react-dom/client')).default;
    const mockRender = vi.fn();
    const mockCreateRoot = ReactDOMDefault.createRoot as ReturnType<typeof vi.fn>;
    
    mockCreateRoot.mockReturnValue({
      render: mockRender,
    });

    await import('./main');

    const mockCalls = mockRender.mock.calls as Array<[React.ReactElement]>;
    const renderedComponent = mockCalls[0][0];
    render(renderedComponent);

    // Check that the component tree includes StrictMode
    // React.StrictMode is represented as a Symbol in React
    expect(renderedComponent.type.toString()).toContain('react.strict_mode');
  });

  it('renders App within StrictMode', async () => {
    const ReactDOMDefault = (await import('react-dom/client')).default;
    const mockRender = vi.fn();
    const mockCreateRoot = ReactDOMDefault.createRoot as ReturnType<typeof vi.fn>;
    
    mockCreateRoot.mockReturnValue({
      render: mockRender,
    });

    await import('./main');

    const mockCalls = mockRender.mock.calls as Array<[React.ReactElement]>;
    const renderedComponent = mockCalls[0][0];
    
    // Check component structure
    expect(renderedComponent).toBeTruthy();
    expect('props' in renderedComponent && (renderedComponent as React.ReactElement).props.children).toBeTruthy();
    
    // The structure should be StrictMode > App
    const { container } = render(renderedComponent);
    expect(container.textContent).toContain('App Component');
  });
});