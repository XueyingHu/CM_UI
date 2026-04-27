import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Login failed. Please try again.");
      }

      const data = await res.json();

      sessionStorage.setItem("session_id", data.session_id);
      sessionStorage.setItem("user_full_name", data.full_name);
      sessionStorage.setItem("user_role", data.role);
      sessionStorage.setItem("user_email", data.email);
      sessionStorage.setItem("user_department", data.department);
      sessionStorage.setItem("user_username", data.username);
      sessionStorage.setItem("session_expires_at", data.expires_at);

      setLocation("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #07203a 0%, #0b2a4a 45%, #1a3f6a 100%)",
      }}
    >
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 28px" }}>
        <div
          style={{
            width: 10, height: 10, borderRadius: "50%", background: "#ffcc33",
            boxShadow: "0 0 0 3px rgba(255,204,51,0.25)",
          }}
        />
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, letterSpacing: 0.4 }}>
          Next Level Continuous Monitoring
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Logo / Title area */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Lock size={24} color="#ffcc33" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>
              BAM Secure Login
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>
              Sign in with your BAM credentials to continue
            </p>
          </div>

          {/* Login card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "28px 28px 24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}
          >
            {error && (
              <div
                data-testid="alert-login-error"
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "#fff5f5", border: "1px solid #fecaca",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 20,
                }}
              >
                <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Username */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: "#1a2e44", marginBottom: 6 }}>
                  BAM Username
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={14}
                    color="#9aa5b4"
                    style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    data-testid="input-username"
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(""); }}
                    placeholder="e.g. sarah.johnson"
                    autoComplete="username"
                    autoFocus
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1px solid #ccd5df", borderRadius: 8,
                      padding: "10px 12px 10px 34px",
                      fontSize: 13, color: "#1a2e44", outline: "none",
                      fontFamily: "Segoe UI, system-ui, sans-serif",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#1e3a6a"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,58,106,0.1)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#ccd5df"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: "#1a2e44", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={14}
                    color="#9aa5b4"
                    style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    data-testid="input-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1px solid #ccd5df", borderRadius: 8,
                      padding: "10px 38px 10px 34px",
                      fontSize: 13, color: "#1a2e44", outline: "none",
                      fontFamily: "Segoe UI, system-ui, sans-serif",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#1e3a6a"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,58,106,0.1)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#ccd5df"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    data-testid="button-toggle-password"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: 2,
                      color: "#9aa5b4", display: "flex", alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                data-testid="button-login"
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "#7a9cc4" : "#0b2a4a",
                  color: "#fff", fontWeight: 900, fontSize: 14,
                  border: "none", borderRadius: 8,
                  padding: "11px 0", cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.15s",
                }}
              >
                {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Hint */}
            <div style={{ marginTop: 18, padding: "10px 14px", background: "#f7f9fd", borderRadius: 8, border: "1px solid #eef2f7" }}>
              <p style={{ fontSize: 11.5, color: "#5b6b7a", margin: 0, fontWeight: 600, lineHeight: 1.6 }}>
                <strong style={{ color: "#1a2e44" }}>Demo credentials:</strong><br />
                Username: <code style={{ background: "#e8eef6", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>sarah.johnson</code> or <code style={{ background: "#e8eef6", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>admin</code><br />
                Password: <code style={{ background: "#e8eef6", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>password123</code> or <code style={{ background: "#e8eef6", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>admin</code>
              </p>
            </div>
          </div>

          {/* Footer links */}
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 12 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
              Forgot Password?
            </button>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>|</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
              Help &amp; Support
            </button>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>|</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ textAlign: "center", padding: "14px 16px", color: "rgba(255,255,255,0.3)", fontSize: 11.5, fontWeight: 600 }}>
        &copy; {new Date().getFullYear()} Next Level Continuous Monitoring &mdash; Confidential &amp; Internal Use Only
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
