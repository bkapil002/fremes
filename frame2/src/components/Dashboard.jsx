import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { email: encodedEmail } = useParams();
  const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const navigate = useNavigate();
  const { user, login } = useAuth(); 

  useEffect(() => {
    if (!encodedEmail) {
      setError("No email provided in URL");
      setLoading(false);
      return;
    }

    let decodedEmail;
    try {
      decodedEmail = atob(encodedEmail); 
      console.log("Decoded email:", decodedEmail);
    } catch (err) {
      setError("Invalid email encoding");
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

        // ✅ Save user in context (global state)
        login({ ...data.user, token: data.token });
        navigate("/meetingList");

        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    doLogin();
  }, [email, login,navigate]);


  return (
     <div className="p-4 space-y-6">
  {/* Header */}
  <div className="bg-gray-300 flex flex-col justify-center items-center animate-pulse rounded-lg shadow-md h-25 mx-auto">
    <div className="w-72 h-8 rounded-md bg-gray-400" />
    <div className="w-40 h-6 mt-3 rounded-md bg-gray-400" />
  </div>


  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* On Air */}
    <div className="bg-gray-300 p-4 rounded-lg shadow-md space-y-3 animate-pulse">
      <div className="h-6 w-28 bg-gray-400 rounded" />
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-gray-400/60 rounded-lg h-20 w-full p-3"
        >
         <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-gray-500 rounded" />
            <div className="h-3 w-20 bg-gray-500 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-500 rounded" />
        </div>
      ))}
    </div>

    {/* Upcoming */}
    <div className="bg-gray-300 p-4 rounded-lg shadow-md space-y-3 animate-pulse">
      <div className="h-6 w-40 bg-gray-400 rounded" /> {/* Section title */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-gray-400/60 rounded-lg h-16 w-full p-3"
        >
         
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-gray-500 rounded" />
            <div className="h-3 w-20 bg-gray-500 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-500 rounded" /> {/* Button placeholder */}
        </div>
      ))}
    </div>
  </div>

  {/* Full Calendar Heading */}
  <div className="bg-gray-300 h-20 p-4 -mb-0.5 rounded-t-lg animate-pulse w-full flex items-center justify-between">
    <div className="flex items-center gap-3">
     
      <div className="h-6 w-40 bg-gray-400 rounded" />
    </div>
    <div className="h-4 w-32 bg-gray-400 rounded" /> {/* Local time */}
  </div>

  {/* Table Skeleton */}
  <div className="overflow-x-auto">
    <div className="bg-gray-300 animate-pulse rounded-b-lg shadow-md">
      {/* Table Head */}
      <div className="grid grid-cols-8 gap-2 p-4 border-b border-gray-200">
        <div className="h-4 bg-gray-400 rounded col-span-2" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-400 rounded" />
        ))}
      </div>

      {/* Table Rows */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-8 gap-2 p-4 border-t border-gray-200"
        >
          <div className="h-4 bg-gray-400 rounded col-span-2" />
          {[...Array(6)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-400 rounded" />
          ))}
        </div>
      ))}
    </div>
  </div>
</div>
  );
}
