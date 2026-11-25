
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./ChangePassword.css";

function ChangePassword() {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [show, setShow] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const togglePassword = (field) => {
        setShow((previous) => ({
            ...previous,
            [field]: !previous[field],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        if (!form.currentPassword || !form.newPassword) {
            setError("Please fill in all required fields.");
            return;
        }

        if (form.newPassword.length < 8 || form.newPassword.length > 72) {
            setError("New password must be between 8 and 72 characters.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        if (form.currentPassword === form.newPassword) {
            setError("Your new password must be different from your current password.");
            return;
        }

        try {
            setLoading(true);

            await api.put("/api/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            setMessage("Your password has been changed successfully.");
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            const status = err.response?.status;
            const backendMessage = err.response?.data?.message;

            if (status === 401) {
                setError("Your session has expired. Please log in again.");
            } else if (status === 403) {
                setError("You are not authorized to change your password.");
            } else {
                setError(
                    backendMessage ||
                    "Unable to change your password. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordField = (label, name, field) => (
        <div className="change-password-field" key={name}>
            <label htmlFor={name}>{label}</label>

            <div className="change-password-input-wrap">
                <input
                    id={name}
                    name={name}
                    type={show[field] ? "text" : "password"}
                    value={form[name]}
                    onChange={handleChange}
                    autoComplete={
                        name === "currentPassword"
                            ? "current-password"
                            : "new-password"
                    }
                    required
                    disabled={loading}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />

                <button
                    type="button"
                    className="password-visibility-button"
                    onClick={() => togglePassword(field)}
                    aria-label={show[field] ? "Hide password" : "Show password"}
                >
                    {show[field] ? "Hide" : "Show"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="change-password-page">
            <div className="change-password-card">
                <div className="change-password-heading">
                    <div className="change-password-icon">🔐</div>
                    <p className="change-password-eyebrow">ACCOUNT SECURITY</p>
                    <h1>Change My Password</h1>
                    <p className="change-password-description">
                        Update your password to keep your account secure.
                    </p>
                </div>

                {message && (
                    <div className="change-password-alert success" role="status">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="change-password-alert error" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {renderPasswordField(
                        "Current password",
                        "currentPassword",
                        "current"
                    )}

                    {renderPasswordField(
                        "New password",
                        "newPassword",
                        "new"
                    )}

                    {renderPasswordField(
                        "Confirm new password",
                        "confirmPassword",
                        "confirm"
                    )}

                    <p className="change-password-hint">
                        Use a password between 8 and 72 characters.
                    </p>

                    <button
                        type="submit"
                        className="change-password-submit"
                        disabled={loading}
                    >
                        {loading ? "Updating password..." : "Update Password"}
                    </button>
                </form>

                <div className="change-password-footer">
                    <Link to="/">Return to Home</Link>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;