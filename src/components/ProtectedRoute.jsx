import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {

    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    // No token → go to login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Token exists but wrong role → go to correct dashboard
    if (allowedRole && role !== allowedRole) {

        if (role === "ADMIN") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (role === "TEACHER") {
            return <Navigate to="/teacher/dashboard" replace />;
        }

        if (role === "STUDENT") {
            return <Navigate to="/student/dashboard" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;