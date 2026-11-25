import { Link } from "react-router-dom";

function Sidebar() {

    return (
        <aside className="sidebar">

            <h3>Admin Panel</h3>

            <nav>

                <Link to="/admin/dashboard">
                    Dashboard
                </Link>

                <Link to="/admin/students">
                    Students
                </Link>

                <Link to="/admin/student-enrollment">
                    Student Enrollment
                </Link>

                <Link to="/admin/teachers">
                    Teachers
                </Link>

                <Link to="/admin/teaching-assignments">
                    Teaching Assignments
                </Link>

                <Link to="/admin/classes">
                    Classes
                </Link>

                <Link to="/admin/sections">
                    Sections
                </Link>

                <Link to="/admin/subjects">
                    Subjects
                </Link>

                <Link to="/admin/timetable">
                    Timetable
                </Link>

                <Link to="/admin/examinations">
                    Examinations
                </Link>

                <Link to="/admin/examination-subject-assignment">
                    Examination Subject Assignment
                </Link>

                <Link to="/admin/marks">
                    Assign Marks
                </Link>

                <Link to="/admin/marks-status">
                    Marks Status
                </Link>                

                <Link to="/admin/result-publication">
                    Result Publication
                </Link>

                <Link to="/admin/results">
                    Results
                </Link>

                <Link to="/admin/fees">
                    Fees
                </Link>

                <Link to="/admin/announcements">
                    Announcements
                </Link>

                {/* ACCOUNT SETTINGS */} <Link to="/change-password"> Change Password </Link>

            </nav>

        </aside>
    );
}

export default Sidebar;