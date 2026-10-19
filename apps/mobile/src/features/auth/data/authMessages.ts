export const accountUnavailable =
  'Account services are not configured yet. You can continue exploring the sample lessons.';

export const emailRequestAccepted =
  'Request accepted. If this address is eligible, an email will follow. Check your inbox and spam folder; delivery may take a few minutes.';

export function authFailureMessage(error: unknown, operation: 'sign-in' | 'email' | 'account') {
  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return 'Too many requests were made. Wait a few minutes before trying again.';
  }
  if (code === 'email_not_confirmed') {
    return 'Open the confirmation email first, then sign in again.';
  }
  if (code === 'weak_password') {
    return 'Choose a longer passphrase that meets the account password requirements.';
  }
  if (operation === 'sign-in') {
    return 'We could not sign you in. Check your email and password, or request a password reset.';
  }
  if (operation === 'email') {
    return 'We could not confirm the email request. Check your connection and try again later.';
  }
  return 'The account request could not be completed. Check your connection and try again.';
}
