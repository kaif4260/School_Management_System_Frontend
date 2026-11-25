import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getStudents, getTeachers, getClasses, getSubjects } from "../../services/dashboardService";


import "./admin.css";

function AdminDashboard() {

    const [studentCount, setStudentCount] = useState(0);
    const [teacherCount, setTeacherCount] = useState(0);
    const [classCount, setClassCount] = useState(0);
    const [subjectCount, setSubjectCount] = useState(0);

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                const students = await getStudents();
                setStudentCount(students.length);

                const teachers = await getTeachers();
                setTeacherCount(teachers.length);

                const classes = await getClasses();
                setClassCount(classes.length);

                const subjects = await getSubjects();
                setSubjectCount(subjects.length);

            } catch (error) {

                console.error(
                    "Failed to fetch students:",
                    error
                );

            }
        };

        fetchDashboardData();

    }, []);

    return (
        <div className="admin-page">

            <Navbar />

            <div className="admin-content">

                <Sidebar />

                <main className="dashboard-main">

                    <h1>Admin Dashboard</h1>

                    <p>
                        Welcome to the School Management System.
                    </p>

                    <div className="dashboard-cards">

                        <div className="dashboard-card">
                            <h3>Students</h3>
                            <p>{studentCount}</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Teachers</h3>
                            <p>{teacherCount}</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Classes</h3>
                            <p>{classCount}</p>
                        </div>

                        <div className="dashboard-card">
                            <h3>Subjects</h3>
                            <p>{subjectCount}</p>
                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default AdminDashboard;