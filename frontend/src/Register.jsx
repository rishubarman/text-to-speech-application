import { useState } from "react";
import "./Register.css";


const API_BASE_URL = import.meta.env.DEV ? "http://localhost:8080" : "";

function Register({ onBackToLogin, onRegistered }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [lampOn, setLampOn] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter a password.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password: password
                    })
                }
            );

            const responseText = await response.text();

            console.log("Register status:", response.status);
            console.log("Register response:", responseText);

            let data = null;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = null;
            }

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    responseText ||
                    "Registration failed."
                );
            }

            setSuccess(
                "Account created successfully! You can now login."
            );

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                if (onRegistered) {
                    onRegistered();
                } else if (onBackToLogin) {
                    onBackToLogin();
                }
            }, 1200);

        } catch (err) {
            console.error("Registration error:", err);

            setError(
                err.message ||
                "Unable to create account."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`register-page ${lampOn ? "lamp-active" : ""}`}
        >

            {/* Ambient room glow */}
            <div className="ambient-glow"></div>

            {/* EXACT SAME LAMP AS LOGIN */}
            <div
                className="lamp-area"
                onMouseEnter={() => setLampOn(true)}
                onMouseLeave={() => setLampOn(false)}
                onClick={() => setLampOn((current) => !current)}
                role="button"
                tabIndex="0"
                aria-label="Toggle lamp"
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        setLampOn((current) => !current);
                    }
                }}
            >
                <div className="lamp-wire"></div>

                <div className="lamp-fixture">
                    <div className="lamp-cap"></div>

                    <div className="lamp-bulb">
                        <div className="bulb-core"></div>
                    </div>

                    <div className="lamp-shade"></div>
                </div>

                <div className="lamp-light-beam"></div>

                <div className="lamp-hint">
                    {lampOn ? "Lamp ON" : "Hover to turn on"}
                </div>
            </div>

            {/* Main content */}
            <main className="register-content">

                {/* VoiceFlow brand */}
                <div className="voiceflow-brand">

                    <div className="brand-icon">
                        <span>◖</span>
                        <span>◗</span>
                    </div>

                    <div>
                        <div className="brand-name">
                            VoiceFlow
                        </div>

                        <div className="brand-subtitle">
                            TEXT TO SPEECH
                        </div>
                    </div>

                </div>

                {/* Register Card */}
                <section className="register-card">

                    <div className="card-top-line"></div>

                    <div className="register-header">

                        <div className="welcome-icon">
                            <span>◉</span>
                        </div>

                        <p className="eyebrow">
                            JOIN VOICEFLOW
                        </p>

                        <h1>
                            Create your account
                        </h1>

                        <p className="register-description">
                            Turn your words into natural speech.
                        </p>

                    </div>

                    {error && (
                        <div className="register-error">
                            <span className="error-icon">!</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="register-success">
                            <span className="success-icon">✓</span>
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister}>

                        {/* NAME */}
                        <div className="register-field">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ♟
                                </span>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                />

                            </div>

                        </div>

                        {/* EMAIL */}
                        <div className="register-field">

                            <label htmlFor="register-email">
                                Email address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    @
                                </span>

                                <input
                                    id="register-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}
                        <div className="register-field">

                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="register-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Minimum 6 characters"
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) => !current
                                        )
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="register-field">

                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (current) => !current
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* CREATE ACCOUNT */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <span className="button-arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </form>

                    {/* DIVIDER */}
                    <div className="divider">

                        <span></span>

                        <p>
                            ALREADY A MEMBER?
                        </p>

                        <span></span>

                    </div>

                    {/* LOGIN */}
                    <div className="back-to-login">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="back-login-button"
                        >
                            Login
                        </button>

                    </div>

                </section>

                {/* FOOTER */}
                <div className="register-footer">

                    <span>
                        Secure authentication
                    </span>

                    <span className="footer-dot">
                        •
                    </span>

                    <span>
                        VoiceFlow
                    </span>

                </div>

            </main>

        </div>
    );
}

export default Register;