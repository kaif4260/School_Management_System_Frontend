import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import PasswordInput from "../../components/PasswordInput";
import "./register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const email = formData.email.trim();

        if (!email) {
            setError("Email is required.");
            return;
        }

        if (!formData.password) {
            setError("Password is required.");
            return;
        }

        if (!formData.confirmPassword) {
            setError("Please confirm your password.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await registerUser(email, formData.password);

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data ||
                "Registration failed. Please try again.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-container">

                {/* Brand Section */}
                <div className="register-brand">

                    <div className="brand-icon">
                        S
                    </div>

                    <h1>
                        School Management System
                    </h1>

                    <p>
                        Create your student account and get access to
                        your school management portal.
                    </p>

                    <div className="brand-line"></div>

                    <span>
                        Learn • Grow • Succeed
                    </span>

                </div>

                {/* Register Card */}
                <div className="register-card">

                    <div className="register-header">
                        <h2>Create Account</h2>

                        <p>
                            Register as a student to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="register-form-group">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="register-form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <PasswordInput
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="register-form-group">
                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <PasswordInput
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="register-error">
                                ⚠ {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="register-success">
                                {success}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>

                    {/* Login Link */}
                    <div className="auth-switch">
                        Already have an account?

                        <Link to="/login">
                            Login
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="register-footer">
                        <span>
                            New registrations are created as Student accounts.
                        </span>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;