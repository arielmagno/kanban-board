import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateBoardModal } from '@/features/board/components/create-board-modal';

const mockMutate = vi.fn();
let mockIsPending = false;
let mockError: unknown = null;

vi.mock('@/features/board/hooks/use-board', () => ({
  useCreateBoard: () => ({ mutate: mockMutate, isPending: mockIsPending, error: mockError }),
}));

// BoardColorPicker is a UI-only dependency; stub it to avoid SVG/canvas issues
vi.mock('@/features/board/components/board-color-picker', () => ({
  BoardColorPicker: () => <div data-testid="color-picker" />,
}));

function setup(onClose = vi.fn()) {
  const user = userEvent.setup();
  render(<CreateBoardModal onClose={onClose} />);
  return {
    user,
    onClose,
    titleInput: () => screen.getByPlaceholderText(/board name/i),
    submitButton: () => screen.getByRole('button', { name: /create board/i }),
    cancelButton: () => screen.getByRole('button', { name: /cancel/i }),
  };
}

describe('CreateBoardModal', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockIsPending = false;
    mockError = null;
  });

  // --- Happy path ---

  it('renders title input, cancel button, and submit button', () => {
    const { titleInput, submitButton, cancelButton } = setup();
    expect(titleInput()).toBeInTheDocument();
    expect(submitButton()).toBeInTheDocument();
    expect(cancelButton()).toBeInTheDocument();
  });

  it('calls createBoard mutate with the entered title on valid submission', async () => {
    const { user, titleInput, submitButton } = setup();
    await user.type(titleInput(), 'My Project');
    await user.click(submitButton());

    expect(mockMutate).toHaveBeenCalledOnce();
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My Project' }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const { user, cancelButton, onClose } = setup();
    await user.click(cancelButton());
    expect(onClose).toHaveBeenCalledOnce();
  });

  // --- Validation edge cases ---

  it('shows an error and does NOT call mutate when title is empty', async () => {
    const { user, submitButton } = setup();
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText(/at least 1 character/i)).toBeInTheDocument();
  });

  it('shows an error and does NOT call mutate when title is whitespace-only', async () => {
    const { user, titleInput, submitButton } = setup();
    await user.type(titleInput(), '   ');
    await user.click(submitButton());

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText(/at least 1 character/i)).toBeInTheDocument();
  });

  it('clears the validation error when the user starts typing again', async () => {
    const { user, submitButton, titleInput } = setup();
    await user.click(submitButton());
    expect(screen.getByText(/at least 1 character/i)).toBeInTheDocument();

    await user.type(titleInput(), 'A');
    expect(screen.queryByText(/at least 1 character/i)).not.toBeInTheDocument();
  });

  // --- Server error display ---

  it('shows a server error message when createBoard.error is set', () => {
    mockError = { response: { data: { error: 'Board limit reached' } } };
    setup();

    expect(screen.getByText('Board limit reached')).toBeInTheDocument();
  });

  it('shows a fallback message when createBoard.error has no API message', () => {
    mockError = {};
    setup();

    expect(screen.getByText(/failed to create board/i)).toBeInTheDocument();
  });

  // --- Loading state ---

  it('disables the submit button while isPending is true', () => {
    mockIsPending = true;
    setup();

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });
});
