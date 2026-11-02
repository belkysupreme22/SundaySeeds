import React, { useState } from "react";
import { Sprout, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { useStaffAuth } from "./useStaffAuth";
import { InputField } from "../../shared/ui/InputField";
import "./auth.css";

export function StaffSignInScreen() {
  const { signIn, bootstrapAdmin, error: authError } = useStaffAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (!res.ok) {
        setLocalError(res.message || "Sign in failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBootstrap = async () => {
    setBootstrapping(true);
    setLocalError(null);
    try {
      const res = await bootstrapAdmin();
      if (!res.ok) {
        setLocalError(res.message || "Failed to bootstrap administrator.");
      }
    } finally {
      setBootstrapping(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-mark">
            <Sprout size={32} />
          </div>
          <h1>SundaySeeds Staff</h1>
          <p>Sign in to your teacher or administrator workspace.</p>
        </div>

        {displayError && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="staff-email">
              <Mail size={16} />
              <span>Email address</span>
            </label>
            <InputField
              id="staff-email"
              type="email"
              placeholder="teacher@sundayseeds.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="staff-password">
              <Lock size={16} />
              <span>Password</span>
            </label>
            <InputField
              id="staff-password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="button tone-yellow auth-submit"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign In to Staff Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
