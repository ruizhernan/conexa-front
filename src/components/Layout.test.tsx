import { render, screen } from '@testing-library/react';
import Layout from './Layout';

describe('Layout Component', () => {
  test('renders children correctly', () => {
    const childText = 'Hello, this is a child element';
    render(
      <Layout>
        <p>{childText}</p>
      </Layout>
    );

    // Check if the child element is rendered
    expect(screen.getByText(childText)).toBeInTheDocument();
  });
});
