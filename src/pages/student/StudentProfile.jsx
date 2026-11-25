
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";
import "./StudentProfile.css";

function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("api/students/me");
        setStudent(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initials = student
    ? `${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`
    : "";

  return (
    <div className="student-profile-page">
      <Navbar />

      <div className="student-profile-layout">
        <StudentSidebar />

        <main className="student-profile-main">
          <div className="student-profile-heading">
            <div>
              <span className="student-profile-eyebrow">
                STUDENT PORTAL
              </span>
              <h1>My Profile</h1>
              <p>View your personal and account information.</p>
            </div>
          </div>

          {loading ? (
            <div className="student-profile-state">
              <div className="student-profile-spinner" />
              <p>Loading your profile...</p>
            </div>
          ) : error ? (
            <div className="student-profile-error">
              <h3>Unable to load profile</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : student ? (
            <>
              <section className="student-profile-card">
                <div className="student-profile-banner" />

                <div className="student-profile-identity">
                  <div className="student-profile-avatar">
                    {initials.toUpperCase() || "S"}
                  </div>

                  <div className="student-profile-identity-text">
                    <h2>
                      {student.firstName} {student.lastName}
                    </h2>
                    <p>{student.email}</p>
                  </div>

                  <span className="student-profile-role">
                    STUDENT
                  </span>
                </div>

                <div className="student-profile-divider" />

                <div className="student-profile-section-heading">
                  <div className="student-profile-section-icon">
                    <span>01</span>
                  </div>
                  <div>
                    <h3>Personal Information</h3>
                    <p>Your registered student details</p>
                  </div>
                </div>

                <div className="student-profile-details">
                  <div className="student-profile-field">
                    <span>Student ID</span>
                    <strong>{student.id ?? "—"}</strong>
                  </div>

                  <div className="student-profile-field">
                    <span>First Name</span>
                    <strong>{student.firstName || "Not provided"}</strong>
                  </div>

                  <div className="student-profile-field">
                    <span>Last Name</span>
                    <strong>{student.lastName || "Not provided"}</strong>
                  </div>

                  <div className="student-profile-field">
                    <span>Email Address</span>
                    <strong>{student.email || "Not provided"}</strong>
                  </div>

                  <div className="student-profile-field">
                    <span>Phone Number</span>
                    <strong>{student.phone || "Not provided"}</strong>
                  </div>

                  <div className="student-profile-field student-profile-address">
                    <span>Address</span>
                    <strong>{student.address || "Not provided"}</strong>
                  </div>
                </div>
              </section>

              <div className="student-profile-note">
                <span className="student-profile-note-icon">i</span>
                <p>
                  Need to update your personal information? Please contact
                  your school administrator.
                </p>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default StudentProfile;