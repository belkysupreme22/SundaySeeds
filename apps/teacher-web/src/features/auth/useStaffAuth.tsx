import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  callRpc,
  getStoredSession,
  setStoredSession,
  signInWithEmailPassword,
  signOutStaff,
  type StaffCourseAssignment,
  type StaffSession,
  type StaffSessionProfile,
} from "../../shared/data/supabaseClient";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated" | "unauthorized";

export interface StaffAuthContextValue {
  session: StaffSession | null;
  user: { id: string; email: string } | null;
  roles: ("admin" | "teacher")[];
  assignedCourses: StaffCourseAssignment[];
  status: AuthStatus;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  bootstrapAdmin: () => Promise<{ ok: boolean; message?: string }>;
  refreshSession: () => Promise<void>;
  hasRole: (role: "admin" | "teacher") => boolean;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(getStoredSession);
  const [roles, setRoles] = useState<("admin" | "teacher")[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<StaffCourseAssignment[]>([]);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchStaffProfile = useCallback(async (currentSession: StaffSession) => {
    try {
      const profile = await callRpc<StaffSessionProfile>(
        "get_my_staff_session",
        {},
        currentSession.accessToken,
      );

      if (!mounted.current) return;

      const userRoles = profile.roles || [];
      const courses = profile.assigned_courses || [];
      setRoles(userRoles);
      setAssignedCourses(courses);

      // If user has neither teacher nor admin role, they are authenticated as a learner
      if (userRoles.length === 0 && courses.length === 0) {
        setStatus("unauthorized");
      } else {
        setStatus("authenticated");
      }
      setError(null);
    } catch (err: unknown) {
      if (!mounted.current) return;
      // If RPC fails because user session is invalid / expired:
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("42501") || msg.includes("authentication_required") || msg.includes("JWT")) {
        setStoredSession(null);
        setSession(null);
        setRoles([]);
        setStatus("unauthenticated");
      } else {
        // Fallback: If table/RPC is not yet populated or error occurs
        setError(msg || "Could not load staff authorization.");
        setStatus("unauthorized");
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const initial = getStoredSession();
    if (initial) {
      void fetchStaffProfile(initial);
    } else {
      setStatus("unauthenticated");
    }

    return () => {
      mounted.current = false;
    };
  }, [fetchStaffProfile]);

  const signIn = async (email: string, pass: string) => {
    setError(null);
    const result = await signInWithEmailPassword(email, pass);
    if (!result.ok || !result.session) {
      setError(result.message || "Sign in failed.");
      return { ok: false, message: result.message };
    }

    setSession(result.session);
    await fetchStaffProfile(result.session);
    return { ok: true };
  };

  const signOut = async () => {
    const currentToken = session?.accessToken;
    setStoredSession(null);
    setSession(null);
    setRoles([]);
    setAssignedCourses([]);
    setStatus("unauthenticated");
    setError(null);
    await signOutStaff(currentToken);
  };

  const bootstrapAdmin = async () => {
    if (!session) {
      return { ok: false, message: "Must be signed in to claim initial administrator." };
    }
    try {
      const profile = await callRpc<StaffSessionProfile>(
        "bootstrap_initial_admin",
        {},
        session.accessToken,
      );
      setRoles(profile.roles || ["admin", "teacher"]);
      setAssignedCourses(profile.assigned_courses || []);
      setStatus("authenticated");
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bootstrap failed.";
      return { ok: false, message: msg };
    }
  };

  const refreshSession = async () => {
    if (session) {
      await fetchStaffProfile(session);
    }
  };

  const hasRole = (role: "admin" | "teacher") => {
    return roles.includes(role);
  };

  return (
    <StaffAuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        roles,
        assignedCourses,
        status,
        error,
        signIn,
        signOut,
        bootstrapAdmin,
        refreshSession,
        hasRole,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth(): StaffAuthContextValue {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }
  return context;
}
