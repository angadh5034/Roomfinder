import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../css/Login.css";

function Login({ onLogin }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  // Sync success message and pre-filled identifier from redirection state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
      if (location.state.identifier) {
        setForm((prev) => ({ ...prev, identifier: location.state.identifier }));
      }
      // Clean up the location state to prevent repeating the message on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "", auth: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) {
      e.identifier = "Email or Username is required";
    }
    if (!form.password.trim()) {
      e.password = "Password is required";
    } else if (form.password.length < 4) {
      e.password = "Password must be at least 4 characters";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const identifierTrimmed = form.identifier.trim();
    const passwordRaw = form.password;

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifierTrimmed,
          password: passwordRaw,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.warn("Failed to parse JSON response", jsonErr);
      }

      if (!response.ok) {
        setErrors({
          auth: data.error || "Invalid Email/Username or Password",
        });
        return;
      }

      // Store JWT token and user info
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // Call onLogin prop to set global state
      onLogin && onLogin();

      // Redirect to profile page
      navigate("/profile");

    } catch (err) {
      console.error("Backend API connection error", err);
      setErrors({
        auth: "Server connection failed. Please ensure the backend server is running and try again.",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-icon">🔑</div>
            <h2>Welcome Back</h2>
            <p>Sign in to continue using SweetHome</p>
          </div>

          {successMsg && (
            <div className="login-success-banner">
              {successMsg}
            </div>
          )}

          {errors.auth && (
            <div className="login-auth-error">
              {errors.auth}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label>Email or Username</label>
              <div className={`login-input-wrap ${errors.identifier ? "error" : ""}`}>
                <span className="input-icon">✉</span>
                <input
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handle}
                  placeholder="e.g. angadh@email.com or angadh"
                />
              </div>
              {errors.identifier && <span className="login-err">{errors.identifier}</span>}
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <div className={`login-input-wrap ${errors.password ? "error" : ""}`}>
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <span className="login-err">{errors.password}</span>}
            </div>

            <button type="submit" className="login-submit-btn">
              Sign In
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="sign-up-link">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
