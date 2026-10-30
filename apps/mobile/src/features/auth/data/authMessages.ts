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
  if (code === 'same_password') {
    return 'Your new password must be different from your previous password.';
  }
  if (code === 'invalid_credentials') {
    return 'The email or password you entered is incorrect. Please check your credentials or reset your password.';
  }
  if (code === 'user_banned') {
    return 'This account is suspended. Contact support if you need assistance.';
  }
  if (code === 'otp_expired') {
    return 'This email link has expired. Request a new email to continue.';
  }
  if (code === 'otp_disabled') {
    return 'This email link has already been used or is disabled. Request a new email.';
  }
  const status =
    error && typeof error === 'object' && 'status' in error && typeof error.status === 'number'
      ? error.status
      : 0;
  if (status >= 500) {
    return 'The account service is temporarily unavailable. Please try again in a few minutes.';
  }
  const message =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';
  if (/network|fetch|timeout|connection|abort/i.test(message) || error instanceof TypeError) {
    return 'Unable to connect to the server. Check your internet connection and try again.';
  }
  if (operation === 'sign-in') {
    return 'We could not sign you in. Check your email and password, or request a password reset.';
  }
  if (operation === 'email') {
    return 'We could not confirm the email request. Check your connection and try again later.';
  }
  return 'The account request could not be completed. Check your connection and try again.';
}
