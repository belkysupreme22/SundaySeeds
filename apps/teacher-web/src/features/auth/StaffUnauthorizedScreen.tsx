import React, { useState } from "react";
import { ShieldAlert, LogOut, Sparkles, Sprout } from "lucide-react";
import { useStaffAuth } from "./useStaffAuth";
import "./auth.css";

export function StaffUnauthorizedScreen() {
  const { user, signOut, bootstrapAdmin } = useStaffAuth();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBootstrap = async () => {
    setBootstrapping(true);
    setError(null);
    try {
      const res = await bootstrapAdmin();
      if (!res.ok) {
        setError(res.message || "Failed to claim initial administrator.");
      }
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-mark tone-peach">
            <ShieldAlert size={32} />
          </div>
          <h1>Staff Access Restricted</h1>
          <p>
            You are signed in as <strong>{user?.email}</strong>.
          </p>
        </div>

        <div className="unauthorized-body">
          <p>
            This account does not have teacher authoring or administrator privileges.
            Staff assignments must be authorized in SundaySeeds development.
          </p>

          {error && <div className="auth-error-banner">{error}</div>}

          <div className="unauthorized-actions">
            <button
              type="button"
              className="button tone-peach"
              onClick={handleBootstrap}
              disabled={bootstrapping}
            >
              <Sparkles size={16} />
              <span>
                {bootstrapping ? "Claiming Admin…" : "Claim Initial Admin (Dev Bootstrap)"}
              </span>
            </button>

            <button
              type="button"
              className="button tone-outline"
              onClick={() => void signOut()}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
