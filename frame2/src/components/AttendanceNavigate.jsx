import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AttendanceNavigate() {
  const { email } = useParams(); // 👈 get `name` not `email`
  const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const navigate = useNavigate();
  const { user, login } = useAuth(); // get user from context

  useEffect(() => {
    if (!email) {
      setError("No name provided in URL");
      setLoading(false);
      return;
    }

    const doLogin = async () => {
      try {
        const res = await fetch(
          `https://samzraa.onrender.com/api/users/auth/${encodeURIComponent(email)}`,
          {
            method: "GET",
            credentials: "include", 
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Authentication failed");
        }


        login({ ...data.user, token: data.token });
        navigate("/attendance");

        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    doLogin();
  }, [name, login]);

  // ✅ UI states
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      
    </div>
  );
}
