import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signin from './Signin';

describe('Signin Component', () => {
  test('renders the signin form', () => {
    render(
      <BrowserRouter>
        <Signin />
      </BrowserRouter>
    );

    // Check for the main heading
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

    // Check for labels
    expect(screen.getByLabelText(/username \(email\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
