import { useState } from "react";
import "./Login.css";


const API_BASE_URL = import.meta.env.DEV ? "http://localhost:8080" : "";

function Login({ onLogin, onShowRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lampOn, setLampOn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password
                    })
                }
            );

            const responseText = await response.text();

            console.log("Login status:", response.status);
            console.log("Login response:", responseText);

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
                    "Invalid email or password."
                );
            }

            if (!data?.token) {
                throw new Error(
                    "Login successful, but token was not received."
                );
            }

            console.log("Login successful:", data);

            if (onLogin) {
                onLogin(data);
            }

        } catch (err) {
            console.error("Login error:", err);

            setError(
                err.message ||
                "Unable to login."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = () => {
        console.log("Create Account clicked");

        if (onShowRegister) {
            onShowRegister();
        } else {
            console.error("onShowRegister prop is missing!");
        }
    };

    return (
        <div
            className={`login-page ${lampOn ? "lamp-active" : ""}`}
        >

            {/* Ambient room glow */}
            <div className="ambient-glow"></div>

            {/* Hanging lamp */}
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
            <main className="login-content">

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

                <section className="login-card">

                    <div className="card-top-line"></div>

                    <div className="login-header">

                        <div className="welcome-icon">
                            <span>◉</span>
                        </div>

                        <p className="eyebrow">
                            WELCOME BACK
                        </p>

                        <h1>
                            Sign in to VoiceFlow
                        </h1>

                        <p className="login-description">
                            Turn your words into natural speech.
                        </p>

                    </div>

                    {error && (
                        <div className="login-error">
                            <span className="error-icon">!</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin}>

                        <div className="login-field">

                            <label htmlFor="login-email">
                                Email address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    @
                                </span>

                                <input
                                    id="login-email"
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

                        <div className="login-field">

                            <div className="password-label-row">

                                <label htmlFor="login-password">
                                    Password
                                </label>

                            </div>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    •
                                </span>

                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) => !current
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <span className="button-arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </form>

                    <div className="divider">
                        <span></span>
                        <p>NEW TO VOICEFLOW?</p>
                        <span></span>
                    </div>

                    <div className="create-account-section">

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            className="create-account-button"
                            onClick={handleCreateAccount}
                        >
                            Create account
                        </button>

                    </div>

                </section>

                <div className="login-footer">
                    <span>Secure authentication</span>
                    <span className="footer-dot">•</span>
                    <span>VoiceFlow</span>
                </div>

            </main>

        </div>
    );
}

export default Login;