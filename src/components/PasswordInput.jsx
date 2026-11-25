import { useState } from "react";

function PasswordInput({
    id = "password",
    value,
    onChange,
    placeholder = "Enter your password",
    required = false,
    minLength,
    name
}) {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="password-wrapper">

            <input
                id={id}
                name={name}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
            />

            <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                    showPassword
                        ? "Hide password"
                        : "Show password"
                }
            >
                {showPassword ? "🙈" : "👁️"}
            </button>

        </div>
    );
}

export default PasswordInput;