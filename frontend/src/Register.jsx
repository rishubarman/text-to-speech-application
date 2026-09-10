import { useState } from "react";
import "./Register.css";

const API_BASE_URL = "http://localhost:8080";

function Register({ onBackToLogin, onRegistered }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        <div className="register-page">

            <div className="register-container">

                <div className="register-logo">
                    🔊 VoiceFlow
                </div>

                <div className="register-card">

                    <div className="register-header">

                        <h1>
                            Create Account
                        </h1>

                        <p>
                            Create your Text to Speech account
                        </p>

                    </div>

                    {error && (
                        <div className="register-error">
                            ⚠ {error}
                        </div>
                    )}

                    {success && (
                        <div className="register-success">
                            ✓ {success}
                        </div>
                    )}

                    <form onSubmit={handleRegister}>

                        <div className="register-field">

                            <label htmlFor="name">
                                Full Name
                            </label>

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

                        <div className="register-field">

                            <label htmlFor="register-email">
                                Email
                            </label>

                            <input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Enter your email"
                                autoComplete="email"
                            />

                        </div>

                        <div className="register-field">

                            <label htmlFor="register-password">
                                Password
                            </label>

                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                            />

                        </div>

                        <div className="register-field">

                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />

                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    👤 Create Account
                                </>
                            )}

                        </button>

                    </form>

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

                </div>

            </div>

        </div>
    );
}

export default Register;