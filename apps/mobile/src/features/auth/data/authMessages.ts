import englishMessages from '../../../i18n/authResults.en.json';

type AuthMessageId = keyof typeof englishMessages;
type AuthMessageKey = `authResults.${AuthMessageId}`;

export type AuthMessage = { message: string; messageKey: AuthMessageKey };

export function authMessage(key: AuthMessageId): AuthMessage {
  return { message: englishMessages[key], messageKey: `authResults.${key}` };
}

export function authResult(ok: boolean, key: AuthMessageId) {
  return { ok, ...authMessage(key) };
}

export function authFailureKey(
  error: unknown,
  operation: 'sign-in' | 'email' | 'account',
): AuthMessageId {
  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return 'rateLimited';
  }
  if (code === 'email_not_confirmed') {
    return 'emailNotConfirmed';
  }
  if (code === 'weak_password') {
    return 'weakPassword';
  }
  if (code === 'same_password') {
    return 'samePassword';
  }
  if (code === 'invalid_credentials') {
    return 'invalidCredentials';
  }
  if (code === 'user_banned') {
    return 'accountSuspended';
  }
  if (code === 'otp_expired') {
    return 'expiredLink';
  }
  if (code === 'otp_disabled') {
    return 'disabledLink';
  }
  const status =
    error && typeof error === 'object' && 'status' in error && typeof error.status === 'number'
      ? error.status
      : 0;
  if (status >= 500) {
    return 'serviceUnavailable';
  }
  const message =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';
  if (/network|fetch|timeout|connection|abort/i.test(message) || error instanceof TypeError) {
    return 'connectionFailed';
  }
  if (operation === 'sign-in') {
    return 'signInFailed';
  }
  if (operation === 'email') {
    return 'emailRequestFailed';
  }
  return 'accountRequestFailed';
}
