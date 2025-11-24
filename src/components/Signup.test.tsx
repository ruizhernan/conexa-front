import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Signup from './Signup';

// Mocking react-router-dom navigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mocking fetch
global.fetch = vi.fn();

describe('Signup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful response
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'User registered successfully!' }),
    });
  });

  test('renders the signup form and submit button is initially disabled', () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username \(email\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });

  test('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/username \(email\)/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Invalid email
    await user.type(usernameInput, 'invalid-email');
    fireEvent.blur(usernameInput);
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();

    // Invalid password
    await user.type(passwordInput, '123');
    fireEvent.blur(passwordInput);
    expect(await screen.findByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });

  test('enables the submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/username \(email\)/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(screen.getByRole('button', { name: /sign up/i })).toBeEnabled();
  });

  test.skip('handles successful signup', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/username \(email\)/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(usernameInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(async () => {
      expect(fetch).toHaveBeenCalledWith('http://srv559732.hstgr.cloud:8080/api/v1/auth/signup', expect.any(Object));
      expect(await screen.findByText('User registered successfully! Redirecting to Sign In...')).toBeInTheDocument();
    });

    // Check for navigation after timeout
    await vi.advanceTimersByTimeAsync(2000);
    expect(mockedNavigate).toHaveBeenCalledWith('/signin');

    vi.useRealTimers();
  });

  test.skip('handles failed signup', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'User already exists' }),
    });

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/username \(email\)/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(usernameInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(async () => {
      expect(await screen.findByText('User already exists')).toBeInTheDocument();
    });
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test.skip('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByTestId('password-toggle');

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
