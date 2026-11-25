import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authService";
import "./login.css";
import PasswordInput from "../../components/PasswordInput";

function Login() {

    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Switch between Sign In and Create Account
    const switchMode = () => {
        setIsRegister(!isRegister);

        // Clear old form data
        setEmail("");
        setPassword("");

        // Clear messages
        setError("");
        setSuccess("");

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            if (isRegister) {

                // CREATE STUDENT ACCOUNT
                await registerUser(email, password);

                setSuccess(
                    "Account created successfully. You can now sign in."
                );

                // Clear form
                setEmail("");
                setPassword("");

                // Switch back to Sign In
                setIsRegister(false);

            } else {

                // SIGN IN
                const data = await loginUser(email, password);

                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("role", data.role);
                localStorage.setItem("userId", data.id);
                localStorage.setItem("email", data.email);

                // Redirect based on role
                if (data.role === "ADMIN") {
                    navigate("/admin/dashboard");
                } else if (data.role === "TEACHER") {
                    navigate("/teacher/dashboard");
                } else if (data.role === "STUDENT") {
                    navigate("/student/dashboard");
                } else {
                    setError("Unknown user role.");
                }
            }

        } catch (err) {

            console.error(err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data) {
                setError(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Something went wrong."
                );
            } else {
                setError(
                    isRegister
                        ? "Unable to create account."
                        : "Invalid email or password."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-page">

            {/* LEFT SIDE */}
            <div className="login-brand">

                <div className="brand-content">

                    <div className="brand-icon">
                        🎓
                    </div>

                    <h1>
                        School Management System
                    </h1>

                    <p>
                        Manage students, teachers, classes,
                        examinations and more from one place.
                    </p>

                    <div className="brand-footer">
                        Simple. Secure. Organized.
                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}
            <div className="login-section">

                <div className="login-card">

                    <div className="login-header">

                        <h2>
                            {isRegister
                                ? "Create Account"
                                : "Welcome Back"}
                        </h2>

                        <p>
                            {isRegister
                                ? "Create your student account"
                                : "Sign in to your account"}
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* PASSWORD */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <PasswordInput
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                minLength={8}
                            />

                        </div>


                        {/* ERROR */}
                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        {/* SUCCESS */}
                        {success && (
                            <div className="login-success">
                                {success}
                            </div>
                        )}


                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading
                                ? isRegister
                                    ? "Creating Account..."
                                    : "Signing In..."
                                : isRegister
                                    ? "Create Account"
                                    : "Sign In"}

                        </button>

                    </form>


                    {/* SWITCH MODE */}
                    <div className="auth-switch">

                        {isRegister ? (
                            <>
                                <span>
                                    Already have an account?
                                </span>

                                <button
                                    type="button"
                                    onClick={switchMode}
                                >
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <>
                                <span>
                                    Don't have an account?
                                </span>

                                <button
                                    type="button"
                                    onClick={switchMode}
                                >
                                    Create Account
                                </button>
                            </>
                        )}

                    </div>


                    <div className="login-footer">
                        School Management System
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;