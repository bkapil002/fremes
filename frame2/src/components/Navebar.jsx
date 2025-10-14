import { useEffect, useRef, useState } from "react";
import Z from "./LOGO.png";
import {  Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

export default function Navebar() {


  const { isAuthenticated, logout, user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [query, setQuery] = useState("");
   const popupRef = useRef(null);
  const popupRef2 =useRef(null)
  const [avatarUrl, setAvatarUrl] = useState(null);
   const logoutTimerRef = useRef(null);

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
        window.location.href = "https://community.samzara.in";
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
    if (!user?.email) return;
    fetch("https://community.samzara.in/getUserByEmail.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: user.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.api_status === 200 && data.user_data?.avatar) {
          setAvatarUrl(`https://community.samzara.in/${data.user_data.avatar}`);
        }
      })
      .catch((err) => console.error("Error:", err));
  }, [user?.email]);


  useEffect(() => {
  if (logoutTimerRef.current) {
    clearTimeout(logoutTimerRef.current);
  }

  if (user?.token) {
    fetch("https://samzraa.onrender.com/api/tokenEXP", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 401) {
          toast.error("Unauthorized. Logging out...");
          handleLogout();
          return;
        }
        const data = await res.json();
        if (data.exp) {
          const expMs = data.exp * 1000; 
          const nowMs = Date.now();
          const timeLeft = expMs - nowMs;

 
          const autoLogoutMs = timeLeft - 2 * 60 * 1000;

          if (autoLogoutMs > 0) {
            logoutTimerRef.current = setTimeout(() => {
              toast("Session expired, logging out...");
              handleLogout();
            }, autoLogoutMs);
          } else {
            handleLogout();
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching token exp:", err);
      });
  }
  return () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
  };
}, [user?.token]);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) setShowPopup(false);
    if (popupRef2.current && !popupRef2.current.contains(e.target)) setShowPopup2(false);
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showPopup, showPopup2]);

  return (
    <nav className=" bg-[#ededed] shadow-sm py-[16px]">
      <div className=" flex pl-6 pr-6 justify-center">
        <div className="flex w-[1120px] items-center  justify-between">
          <Link to={'https://community.samzara.in'} className="flex items-center ">
            <img
              src={Z}
              alt="Logo"
              className=" w-30  md:w-[180px] cursor-pointer  object-cover"
            />
          </Link>

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
          <div className=" flex  items-center gap-4.5">
            {!isAuthenticated ? (
              <div className=" flex gap-4.5">
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
                <div className="w-[27px] h-[27px] rounded-full object-cover bg-gray-400 animate-pulse" ></div>
              </div>
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
                <div className="relative" >
                  <img
                    src={
                      avatarUrl ||
                      "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                    }
                    alt="User"
                    className="w-[27px] h-[27px] rounded-full object-cover"
                     onClick={() => {
                      setShowPopup(true);
                      setShowPopup2(true);
                    }}
                  />
                  {showPopup && (
                    <div ref={popupRef} className="absolute shadow-xl -right-5 -mt-[43px] w-[250px] h-[120px] bg-white rounded-lg z-50 hidden md:block">
                      <div className="px-2 py-4 border-b border-gray-200 text-black text-[14px] font-semibold">
                        <Link to={`https://community.samzara.in/${user.name}`} className="flex px-3 -mt-2 py-2 mb-1 items-center place-content-between bg-[#f5f5f5] hover:bg-[#272974] hover:text-white cursor-pointer rounded-[10px]">
                          {user?.name || "User"}
                          <img
                            src={
                              avatarUrl ||
                              "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                            }
                            alt="User"
                            className="w-[27px] h-[27px] rounded-full object-cover"
                          />
                        </Link>
                      </div>
                      <ul>
                        <li
                          className="px-4 py-2 cursor-pointer font-medium text-[15px] hover:bg-[#272974] text-[#555] hover:text-white"
                          onClick={handleLogout}
                        >
                          <i className="ri-logout-box-r-line"></i>
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

        {showPopup2 && (
          <div
          ref={popupRef2}
           className="fixed top-13.5 sm:right-3   overflow-y-auto w-full sm:w-62  bg-white z-50 block md:hidden animate-slide-in rounded-[4px]">
            {/* Close Button */}
            <div className="flex justify-between items-center p-4 px-2">
              <div className="w-full   border-gray-200 text-black text-[14px] ">
                <div className="flex px-4.5 font-bold -mt-2 py-1.5 items-center place-content-between bg-[#f5f5f5] hover:bg-[#272974] hover:text-white cursor-pointer rounded-[10px]">
                  <p className="px-2">{user?.name || "User"}</p>

                  <img
                    src={
                      avatarUrl ||
                      "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                    }
                    alt="User"
                    className="w-[27px] h-[27px] rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Menu Items */}
              <ul className=" px-7 space-y-3  text-[#828282] font-medium text-[15px]">
              <a href="https://community.samzara.in/search" onClick={() => setShowPopup(false)}   className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                  ></path>
                </svg>{" "}
                Search
              </a>
              <li>
                <div className=" border-b-[1px] -mx-6 mt-6 mb-6 border-gray-200  "></div>
              </li>
              <a href="https://community.samzara.in/setting" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M10 4A4 4 0 0 0 6 8A4 4 0 0 0 10 12A4 4 0 0 0 14 8A4 4 0 0 0 10 4M17 12C16.87 12 16.76 12.09 16.74 12.21L16.55 13.53C16.25 13.66 15.96 13.82 15.7 14L14.46 13.5C14.35 13.5 14.22 13.5 14.15 13.63L13.15 15.36C13.09 15.47 13.11 15.6 13.21 15.68L14.27 16.5C14.25 16.67 14.24 16.83 14.24 17C14.24 17.17 14.25 17.33 14.27 17.5L13.21 18.32C13.12 18.4 13.09 18.53 13.15 18.64L14.15 20.37C14.21 20.5 14.34 20.5 14.46 20.5L15.7 20C15.96 20.18 16.24 20.35 16.55 20.47L16.74 21.79C16.76 21.91 16.86 22 17 22H19C19.11 22 19.22 21.91 19.24 21.79L19.43 20.47C19.73 20.34 20 20.18 20.27 20L21.5 20.5C21.63 20.5 21.76 20.5 21.83 20.37L22.83 18.64C22.89 18.53 22.86 18.4 22.77 18.32L21.7 17.5C21.72 17.33 21.74 17.17 21.74 17C21.74 16.83 21.73 16.67 21.7 16.5L22.76 15.68C22.85 15.6 22.88 15.47 22.82 15.36L21.82 13.63C21.76 13.5 21.63 13.5 21.5 13.5L20.27 14C20 13.82 19.73 13.65 19.42 13.53L19.23 12.21C19.22 12.09 19.11 12 19 12H17M10 14C5.58 14 2 15.79 2 18V20H11.68A7 7 0 0 1 11 17A7 7 0 0 1 11.64 14.09C11.11 14.03 10.56 14 10 14M18 15.5C18.83 15.5 19.5 16.17 19.5 17C19.5 17.83 18.83 18.5 18 18.5C17.16 18.5 16.5 17.83 16.5 17C16.5 16.17 17.17 15.5 18 15.5Z"
                  ></path>
                </svg>{" "}
                Settings
              </a>
              <li className="flex items-center gap-4 cursor-pointer">
                Night mode
              </li>
              <li
                onClick={handleLogout}
                className="flex items-center mb-3  cursor-pointer "
              >
                <i className="ri-logout-box-r-line"></i> Log Out
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
