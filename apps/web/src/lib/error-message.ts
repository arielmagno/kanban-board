import type { AxiosError } from 'axios';

interface ApiErrorBody {
  error?: string;
  message?: string;
}

type CardAction = 'move' | 'create' | 'edit' | 'delete';

const ACTION_LABEL: Record<CardAction, string> = {
  move:   'move',
  create: 'create',
  edit:   'edit',
  delete: 'delete',
};

export function getCardErrorMessage(
  err: unknown,
  action: CardAction,
): { title: string; message: string } {
  const axiosErr = err as AxiosError<ApiErrorBody> | null;
  const status = axiosErr?.response?.status;
  const serverMsg =
    axiosErr?.response?.data?.error ?? axiosErr?.response?.data?.message;

  if (!axiosErr?.response) {
    return {
      title: 'Connection error',
      message: 'Unable to reach the server. Check your internet connection and try again.',
    };
  }

  switch (status) {
    case 403:
      return {
        title: 'Access denied',
        message: `You don't have permission to ${ACTION_LABEL[action]} this card. Only the board owner can make changes.`,
      };
    case 404:
      return {
        title: 'Card not found',
        message: 'This card no longer exists — it may have been deleted by another user.',
      };
    case 400:
      return {
        title: 'Invalid request',
        message: serverMsg ?? 'Please check your input and try again.',
      };
    default:
      return {
        title: `Failed to ${ACTION_LABEL[action]} card`,
        message: serverMsg ?? 'Something went wrong on our end. Please try again.',
      };
  }
}
