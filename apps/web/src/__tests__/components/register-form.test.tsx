import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/features/auth/components/register-form';

const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useRegister: () => ({ mutate: mockMutate, isPending: mockIsPending }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function setup() {
  const user = userEvent.setup();
  render(<RegisterForm />);
  return {
    user,
    fullNameInput: () => screen.getByLabelText(/full name/i),
    emailInput: () => screen.getByLabelText(/email/i),
    passwordInput: () => screen.getByLabelText(/password/i, { selector: 'input' }),
    submitButton: () => screen.getByRole('button', { name: /create account/i }),
  };
}

describe('RegisterForm', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockIsPending = false;
  });

  // --- Happy path ---

  it('renders fullName, email, password inputs and submit button', () => {
    const { fullNameInput, emailInput, passwordInput, submitButton } = setup();
    expect(fullNameInput()).toBeInTheDocument();
    expect(emailInput()).toBeInTheDocument();
    expect(passwordInput()).toBeInTheDocument();
    expect(submitButton()).toBeInTheDocument();
  });

  it('calls register mutate with correct values on valid submission', async () => {
    const { user, fullNameInput, emailInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), 'Alice Smith');
    await user.type(emailInput(), 'alice@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).toHaveBeenCalledOnce();
    expect(mockMutate).toHaveBeenCalledWith(
      { fullName: 'Alice Smith', email: 'alice@test.com', password: 'password123' },
      expect.any(Object),
    );
  });

  // --- Validation edge cases ---

  it('does NOT call mutate when fullName is empty', async () => {
    const { user, emailInput, passwordInput, submitButton } = setup();
    await user.type(emailInput(), 'alice@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does NOT call mutate when fullName is whitespace-only', async () => {
    const { user, fullNameInput, emailInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), '   ');
    await user.type(emailInput(), 'alice@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does NOT call mutate when email is empty', async () => {
    const { user, fullNameInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), 'Alice');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does NOT call mutate when email is not a valid address', async () => {
    const { user, fullNameInput, emailInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), 'Alice');
    await user.type(emailInput(), 'not-an-email');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does NOT call mutate when password is shorter than 8 characters', async () => {
    const { user, fullNameInput, emailInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), 'Alice');
    await user.type(emailInput(), 'alice@test.com');
    await user.type(passwordInput(), 'short');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
  });

  // --- Server error handling ---

  it('shows a duplicate-email warning when the server returns 409', async () => {
    mockMutate.mockImplementation((_dto, { onError }: { onError: (e: unknown) => void }) => {
      onError({ response: { status: 409 } });
    });

    const { user, fullNameInput, emailInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), 'Alice');
    await user.type(emailInput(), 'alice@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(screen.getByText(/already got an account/i)).toBeInTheDocument();
  });

  it('clears the duplicate-email error when the user edits the email field', async () => {
    mockMutate.mockImplementation((_dto, { onError }: { onError: (e: unknown) => void }) => {
      onError({ response: { status: 409 } });
    });

    const { user, fullNameInput, emailInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), 'Alice');
    await user.type(emailInput(), 'alice@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(screen.getByText(/already got an account/i)).toBeInTheDocument();

    await user.type(emailInput(), 'x');
    expect(screen.queryByText(/already got an account/i)).not.toBeInTheDocument();
  });

  it('shows a generic error when the server fails with a non-409 error', async () => {
    mockMutate.mockImplementation((_dto, { onError }: { onError: (e: unknown) => void }) => {
      onError({ response: { status: 500 } });
    });

    const { user, fullNameInput, emailInput, passwordInput, submitButton } = setup();
    await user.type(fullNameInput(), 'Alice');
    await user.type(emailInput(), 'alice@test.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitButton());

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  // --- Loading state ---

  it('disables the submit button while isPending is true', () => {
    mockIsPending = true;
    setup();
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });
});
