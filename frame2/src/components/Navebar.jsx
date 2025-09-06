import { useEffect, useRef, useState } from "react";
import { TbLogout, TbLogin2 } from "react-icons/tb";
import Z from "./LOGO.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

export default function Navebar() {
  const navigate = useNavigate();

  const { isAuthenticated, logout, user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [query, setQuery] = useState("");
  const popupRef = useRef(null);

  const handleLogout = async () => {
    try {
      const response = await fetch("https://samzraa.onrender.com/api/users/logOut", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        logout();
        navigate("/signin");
        toast.success("Logged out successfully");
      } else {
        const errorData = await response.json();
        toast.error(`Logout failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className=" bg-[#ededed] shadow-sm py-[16px]">
      <div className=" flex justify-center">
        <div className="flex w-[1120px] items-center  justify-between">
          <div className="flex items-center ">
            <img
              src={Z}
              alt="Logo"
              className=" w-[180px]   md:w-40 object-cover"
            />
          </div>

          {/* Center - Navigation Icons (Desktop only) */}
          <div className=" hidden md:flex justify-center items-center  ">
            <div className="flex items-center bg-white border border-gray-400 rounded-lg px-3 py-2 w-[360px] h-[40px] ">
              <Search className="text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ml-2 w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right - Action Icons (Desktop) */}
          <div className="hidden md:flex  items-center gap-4.5">
            {!isAuthenticated ? (
              <Link to="/signin">
                <TbLogin2 className="text-gray-800 cursor-pointer text-2xl" />
              </Link>
            ) : (
              <>
               
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="23"
                    height="23"
                    color="#666"
                  >
                    <path
                      d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 8a3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4 3.91 3.91 0 0 0-4 4zm6 0a1.91 1.91 0 0 1-2 2 1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2zM4 18a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1h2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="23"
                    height="23"
                    color="#666"
                    fill="currentColor"
                  >
                    <path d="M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.766L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.234V16H4V4h16v12z"></path>
                    <circle cx="15" cy="10" r="2"></circle>
                    <circle cx="9" cy="10" r="2"></circle>
                  </svg>
                </div>
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="23"
                    height="23"
                    color="#666"
                  >
                    <path
                      d="M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <div className="relative" ref={popupRef}>
                  <img
                    src={
                      user?.imageUrls[0] ||
                      "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                    }
                    alt="User"
                    className="w-[27px] h-[27px] rounded-full object-cover"
                    onClick={() => setShowPopup((prev) => !prev)}
                  />
                  {showPopup && (
                    <div className="absolute   -right-5 -mt-[43px] w-[250px] h-[167px]  bg-white  rounded-lg shadow-lg z-50">
                      <div className="px-2 py-4  border-b  border-gray-200 text-black text-[14px]    font-semibold">
                        <div className=" flex px-3 -mt-2 py-2 mb-1  items-center  place-content-between bg-[#f5f5f5] hover:bg-[#272974] hover:text-white cursor-pointer rounded-[10px]">
                        {user?.name || "User"}
                        <img
                          src={
                            user?.imageUrls[0] ||
                            "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                          }
                          alt="User"
                          className="w-[27px] h-[27px] rounded-full object-cover"
                        />
                        </div>
                      </div>
                      <ul>
                        <li
                          className="px-4 py-2 hover:bg-[#272974] font-medium text-[15px] text-[#555]  hover:text-white mt-2  cursor-pointer"
                          onClick={() => navigate("/profile")}
                        >
                          Night mode
                        </li>

                        <li
                          className="px-4 py-2  cursor-pointer font-medium text-[15px] hover:bg-[#272974] text-[#555]  hover:text-white"
                          onClick={handleLogout}
                        >
                          <i class="ri-logout-box-r-line"></i>
                          Log Out
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
