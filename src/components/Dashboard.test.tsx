import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Dashboard from './Dashboard';

// Mocking react-router-dom navigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mocking localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mocking fetch
global.fetch = vi.fn();

const mockApiResponse = (data: any) => {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem('jwt_token', 'fake_token');
    mockApiResponse({
      results: [
        { uid: '1', name: 'Luke Skywalker', properties: { name: 'Luke Skywalker' } },
        { uid: '2', name: 'C-3PO', properties: { name: 'C-3PO' } },
      ],
      totalPages: 1,
    });
  });

  test('renders loading state initially and then displays data', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
      expect(screen.getByText('C-3PO')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
  });

  test('handles API error on initial fetch', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Network Error')).toBeInTheDocument();
    });
  });

  test('logs out user if no token is found', async () => {
    localStorageMock.removeItem('jwt_token');
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  test('changes category and fetches new data when a category button is clicked', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Initial data
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Mock new data for 'films'
    mockApiResponse({
      results: [
        { uid: '1', title: 'A New Hope', properties: { title: 'A New Hope' } },
      ],
      totalPages: 1,
    });
    
    // Find sidebar button and click it
    const filmsButton = screen.getByRole('button', { name: /films/i });
    fireEvent.click(filmsButton);
    
    // Wait for the new data to be displayed
    await waitFor(() => {
        expect(screen.getByText('A New Hope')).toBeInTheDocument();
        expect(screen.queryByText('Luke Skywalker')).not.toBeInTheDocument();
    });

    // Check if the fetch was called for the new category
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/films'), expect.any(Object));
  });
  
  test('displays no data available message', async () => {
    mockApiResponse({ results: [], totalPages: 0 });
    render(
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    );

    await waitFor(() => {
        expect(screen.getByText('No data available.')).toBeInTheDocument();
    });
  });
});
