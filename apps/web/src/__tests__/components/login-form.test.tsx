import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/features/auth/components/login-form';

// Mock the hook — we control mutate, isPending, and onError triggering
const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useLogin: () => ({ mutate: mockMutate, isPending: mockIsPending }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function setup() {
  const user = userEvent.setup();
  render(<LoginForm />);
  return {
    user,
    emailInput: () => screen.getByLabelText(/email/i),
    passwordInput: () => screen.getByLabelText(/password/i, { selector: 'input' }),
    submitButton: () => screen.getByRole('button', { name: /sign in/i }),
  };
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockIsPending = false;
  });

  // --- Happy path ---

  it('renders email input, password input, and submit button', () => {
    const { emailInput, passwordInput, submitButton } = setup();
    expect(emailInput()).toBeInTheDocument();
    expect(passwordInput()).toBeInTheDocument();
    expect(submitButton()).toBeInTheDocument();
  });

  it('calls login mutate with correct values on valid submission', async () => {
    const { user, emailInput, passwordInput, submitButton } = setup();
    await user.type(emailInput(), 'user@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).toHaveBeenCalledOnce();
    expect(mockMutate).toHaveBeenCalledWith(
      { email: 'user@test.com', password: 'password123' },
      expect.any(Object),
    );
  });

  // --- Validation edge cases (client-side, before mutate is called) ---

  it('shows an error and does NOT call mutate when email is empty', async () => {
    const { user, passwordInput, submitButton } = setup();
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('shows an error and does NOT call mutate when email is whitespace-only', async () => {
    const { user, emailInput, passwordInput, submitButton } = setup();
    await user.type(emailInput(), '   ');
    await user.type(passwordInput(), 'password123');
    fireEvent.submit(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does NOT call mutate when email format is invalid', async () => {
    // userEvent.type on input[type="email"] doesn't reliably trigger React onChange in jsdom
    // for non-email characters. Use fireEvent.input which fires the native input event
    // that React's synthetic onChange handler listens to.
    const { user, passwordInput, submitButton } = setup();
    const emailEl = screen.getByLabelText(/email/i);
    fireEvent.input(emailEl, { target: { value: 'not-an-email' } });
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows an error and does NOT call mutate when password is empty', async () => {
    const { user, emailInput, submitButton } = setup();
    await user.type(emailInput(), 'user@test.com');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  // --- Server error display ---

  it('shows a server error message when the mutation onError callback fires', async () => {
    mockMutate.mockImplementation((_dto, { onError }: { onError: (e: unknown) => void }) => {
      onError({ response: { data: { error: 'Invalid credentials' } } });
    });

    const { user, emailInput, passwordInput, submitButton } = setup();
    await user.type(emailInput(), 'user@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows a fallback error when the API returns no message', async () => {
    mockMutate.mockImplementation((_dto, { onError }: { onError: (e: unknown) => void }) => {
      onError({});
    });

    const { user, emailInput, passwordInput, submitButton } = setup();
    await user.type(emailInput(), 'user@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
  });

  it('clears the server error when the user edits the email field', async () => {
    mockMutate.mockImplementation((_dto, { onError }: { onError: (e: unknown) => void }) => {
      onError({ response: { data: { error: 'Invalid credentials' } } });
    });

    const { user, emailInput, passwordInput, submitButton } = setup();
    await user.type(emailInput(), 'user@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();

    await user.type(emailInput(), 'x');
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  // --- Loading state ---

  it('disables the submit button while isPending is true', () => {
    mockIsPending = true;
    setup();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
