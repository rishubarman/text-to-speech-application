import { useState } from "react";
import "./Login.css";

const API_BASE_URL = "http://localhost:8080";

function Login({ onLogin, onShowRegister }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

            const responseText =
                await response.text();

            console.log(
                "Login status:",
                response.status
            );

            console.log(
                "Login response:",
                responseText
            );

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

            console.log(
                "Login successful:",
                data
            );

            if (onLogin) {
                onLogin(data);
            }

        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            setError(
                err.message ||
                "Unable to login."
            );

        } finally {

            setLoading(false);
        }
    };

    /*
     * THIS FUNCTION OPENS REGISTER PAGE
     */
    const handleCreateAccount = () => {

        console.log(
            "Create Account clicked"
        );

        if (onShowRegister) {
            onShowRegister();
        } else {
            console.error(
                "onShowRegister prop is missing!"
            );
        }
    };

    return (

        <div className="login-page">

            <div className="login-container">

                <div className="login-logo">
                    🔊 VoiceFlow
                </div>

                <div className="login-card">

                    <div className="login-header">

                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Login to your Text to Speech account
                        </p>

                    </div>

                    {error && (

                        <div className="login-error">
                            ⚠ {error}
                        </div>

                    )}

                    <form onSubmit={handleLogin}>

                        <div className="login-field">

                            <label htmlFor="login-email">
                                Email
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Enter your email"
                                autoComplete="email"
                            />

                        </div>

                        <div className="login-field">

                            <label htmlFor="login-password">
                                Password
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <span className="spinner"></span>
                                    Logging in...
                                </>

                            ) : (

                                <>
                                    🔐 Login
                                </>

                            )}

                        </button>

                    </form>

                    <div className="create-account-section">

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            className="create-account-button"
                            onClick={handleCreateAccount}
                        >
                            Create Account
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;