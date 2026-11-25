function Navbar() {

    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");

        window.location.href = "/";
    };

    return (
        <nav className="navbar">

            <div>
                <h2>School Management System</h2>
            </div>

            <div>
                <span>{email}</span>
                <span> | {role}</span>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>

        </nav>
    );
}

export default Navbar;