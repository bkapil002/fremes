import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AttendanceNavigate() {
  const { email } = useParams(); 
  const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const navigate = useNavigate();
  const {  login } = useAuth(); 

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
        window.location.href = "https://community.samzara.in";
      } finally {
        setLoading(false);
      }
    };

    doLogin();
  }, [email, login,navigate]);


  return (
  <div className="p-2">
      
      <div className="  mt-3   h-20  rounded-lg bg-gray-300 animate-pulse "> </div>
       <div className="flex  flex-col md:flex-row mt-4 justify-between gap-4 px-4 md:px-6 text-xs sm:text-sm">
        <div>
      <div className="bg-gray-300 animate-pulse  rounded-2xl h-5 w-90 "></div>
      <div className="bg-gray-300 animate-pulse mt-1 rounded-2xl h-5 w-70 "></div>
      </div>
      <div className="">
        <div className="bg-gray-300 animate-pulse  rounded-2xl h-5 w-90 "></div>
        <div className="bg-gray-300 animate-pulse mt-1 rounded-2xl h-5 w-30 "></div>
      </div>
      </div>
      <div className="mt-5.5 flex  h-60  rounded-lg bg-gray-300 animate-pulse">
      </div>

    </div>
  );
}
