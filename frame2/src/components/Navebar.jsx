import { useEffect, useRef, useState } from "react";
import Z from "./LOGO.png";
import {  Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

export default function Navebar() {
  const navigate = useNavigate();

  const { isAuthenticated, logout, user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [query, setQuery] = useState("");
  const popupRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

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
        navigate("https://community.samzara.in");
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

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (popupRef.current && !popupRef.current.contains(event.target)) {
  //       setShowPopup(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);
  useEffect(() => {
      function handleClickOutside(event) {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          setShowPopup(false);
        }
      }
  
      if (showPopup) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showPopup]);

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
                <div className="relative" ref={popupRef}>
                  <img
                    src={
                      avatarUrl ||
                      "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                    }
                    alt="User"
                    className="w-[27px] h-[27px] rounded-full object-cover"
                    onClick={() => setShowPopup(true)}
                  />
                  {showPopup && (
                    <div className="absolute shadow-xl -right-5 -mt-[43px] w-[250px] h-[167px] bg-white rounded-lg z-50 hidden md:block">
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
                          className="px-4 py-2 hover:bg-[#272974] font-medium text-[15px] text-[#555] hover:text-white mt-2 cursor-pointer"
                          onClick={() => navigate("/profile")}
                        >
                          Night mode
                        </li>

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
        {showPopup && (
          <div
           className="fixed top-13.5 sm:right-3  bottom-22  sm:bottom-40  overflow-y-auto w-full sm:w-62  bg-white z-50 block md:hidden animate-slide-in rounded-[4px]">
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
              <a href="https://community.samzara.in/pages" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z"
                  ></path>
                </svg>{" "}
                Page
              </a>
              <a href="https://community.samzara.in/my-products" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M12,13A5,5 0 0,1 7,8H9A3,3 0 0,0 12,11A3,3 0 0,0 15,8H17A5,5 0 0,1 12,13M12,3A3,3 0 0,1 15,6H9A3,3 0 0,1 12,3M19,6H17A5,5 0 0,0 12,1A5,5 0 0,0 7,6H5C3.89,6 3,6.89 3,8V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V8C21,6.89 20.1,6 19,6Z"
                  ></path>
                </svg>{" "}
                My Products
              </a>
              <a  href="https://community.samzara.in/products" onClick={() => setShowPopup(false)}  className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M12,18H6V14H12M21,14V12L20,7H4L3,12V14H4V20H14V14H18V20H20V14M20,4H4V6H20V4Z"
                  ></path>
                </svg>{" "}
                Market
              </a>
              <a href="https://community.samzara.in/blogs" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z"
                  ></path>
                </svg>{" "}
                Blog
              </a>
              <a href="https://community.samzara.in/my-blogs" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M14,10H19.5L14,4.5V10M5,3H15L21,9V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3M5,12V14H19V12H5M5,16V18H14V16H5Z"
                  ></path>
                </svg>{" "}
                My articles
              </a>
              <a href="https://community.samzara.in/movies/" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M18,9H16V7H18M18,13H16V11H18M18,17H16V15H18M8,9H6V7H8M8,13H6V11H8M8,17H6V15H8M18,3V5H16V3H8V5H6V3H4V21H6V19H8V21H16V19H18V21H20V3H18Z"
                  ></path>
                </svg>{" "}
                Movies
              </a>

              <a href="https://community.samzara.in/events/" onClick={() => setShowPopup(false)}  className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"
                  ></path>
                </svg>{" "}
                Events
              </a>
              <a href="https://community.samzara.in/groups" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"
                  ></path>
                </svg>{" "}
                My Groups
              </a>
              <a href="https://community.samzara.in/forum" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M17,12V3A1,1 0 0,0 16,2H3A1,1 0 0,0 2,3V17L6,13H16A1,1 0 0,0 17,12M21,6H19V15H6V17A1,1 0 0,0 7,18H18L22,22V7A1,1 0 0,0 21,6Z"
                  ></path>
                </svg>{" "}
                Forum
              </a>
              <a href="https://community.samzara.in/albums" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
                  ></path>
                </svg>{" "}
                Albums
              </a>
              <a href="https://community.samzara.in/saved-posts" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"
                  ></path>
                </svg>{" "}
                Saved Posts
              </a>
              <a href="https://community.samzara.in/poke" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M13.75,10.19L14.38,10.32L18.55,12.4C19.25,12.63 19.71,13.32 19.65,14.06V14.19L19.65,14.32L18.75,20.44C18.69,20.87 18.5,21.27 18.15,21.55C17.84,21.85 17.43,22 17,22H10.12C9.63,22 9.18,21.82 8.85,21.47L2.86,15.5L3.76,14.5C4,14.25 4.38,14.11 4.74,14.13H5.03L9,15V4.5A2,2 0 0,1 11,2.5A2,2 0 0,1 13,4.5V10.19H13.75Z"
                  ></path>
                </svg>{" "}
                Pokes
              </a>
              <a href="https://community.samzara.in/search?query=" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M14.19,14.19L6,18L9.81,9.81L18,6M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,10.9A1.1,1.1 0 0,0 10.9,12A1.1,1.1 0 0,0 12,13.1A1.1,1.1 0 0,0 13.1,12A1.1,1.1 0 0,0 12,10.9Z"
                  ></path>
                </svg>{" "}
                Explore
              </a>
              <a href="https://community.samzara.in/most_liked" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"
                  ></path>
                </svg>{" "}
                Popular Posts
              </a>

              <a href="https://community.samzara.in/new-game" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M7.97,16L5,19C4.67,19.3 4.23,19.5 3.75,19.5A1.75,1.75 0 0,1 2,17.75V17.5L3,10.12C3.21,7.81 5.14,6 7.5,6H16.5C18.86,6 20.79,7.81 21,10.12L22,17.5V17.75A1.75,1.75 0 0,1 20.25,19.5C19.77,19.5 19.33,19.3 19,19L16.03,16H7.97M7,8V10H5V11H7V13H8V11H10V10H8V8H7M16.5,8A0.75,0.75 0 0,0 15.75,8.75A0.75,0.75 0 0,0 16.5,9.5A0.75,0.75 0 0,0 17.25,8.75A0.75,0.75 0 0,0 16.5,8M14.75,9.75A0.75,0.75 0 0,0 14,10.5A0.75,0.75 0 0,0 14.75,11.25A0.75,0.75 0 0,0 15.5,10.5A0.75,0.75 0 0,0 14.75,9.75M18.25,9.75A0.75,0.75 0 0,0 17.5,10.5A0.75,0.75 0 0,0 18.25,11.25A0.75,0.75 0 0,0 19,10.5A0.75,0.75 0 0,0 18.25,9.75M16.5,11.5A0.75,0.75 0 0,0 15.75,12.25A0.75,0.75 0 0,0 16.5,13A0.75,0.75 0 0,0 17.25,12.25A0.75,0.75 0 0,0 16.5,11.5Z"
                  ></path>
                </svg>{" "}
                Games
              </a>
              <a href="https://community.samzara.in/friends-nearby/" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M10,4A4,4 0 0,1 14,8C14,8.91 13.69,9.75 13.18,10.43C12.32,10.75 11.55,11.26 10.91,11.9L10,12A4,4 0 0,1 6,8A4,4 0 0,1 10,4M2,20V18C2,15.88 5.31,14.14 9.5,14C9.18,14.78 9,15.62 9,16.5C9,17.79 9.38,19 10,20H2Z"
                  ></path>
                </svg>{" "}
                Find friends
              </a>
              <a href="https://community.samzara.in/jobs" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M10,2H14A2,2 0 0,1 16,4V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4C2.89,21 2,20.1 2,19V8C2,6.89 2.89,6 4,6H8V4C8,2.89 8.89,2 10,2M14,6V4H10V6H14Z"
                  ></path>
                </svg>{" "}
                Jobs
              </a>
              <a href="https://community.samzara.in/events/" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M7 12C9.2 12 11 10.2 11 8S9.2 4 7 4 3 5.8 3 8 4.8 12 7 12M11 20V14.7C9.9 14.3 8.5 14 7 14C3.1 14 0 15.8 0 18V20H11M15 4C13.9 4 13 4.9 13 6V18C13 19.1 13.9 20 15 20H22C23.1 20 24 19.1 24 18V6C24 4.9 23.1 4 22 4H15Z"
                  ></path>
                </svg>{" "}
                Common Things
              </a>
              <a href="https://community.samzara.in/funding" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M21 13C21.6 13 22.1 13.2 22.4 13.6C22.8 14 23 14.5 23 15L15 18L8 16V7H9.9L17.2 9.7C17.7 9.9 18 10.3 18 10.8C18 11.1 17.9 11.4 17.7 11.6C17.5 11.8 17.2 12 16.8 12H14L12.3 11.3L12 12.2L14 13H21M2 7H6V18H2V7Z"
                  ></path>
                </svg>{" "}
                Fundings
              </a>

              <a href="https://community.samzara.in/memories" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"
                  ></path>
                </svg>{" "}
                Memories
              </a>
              <a href="https://community.samzara.in/offers" onClick={() => setShowPopup(false)} className="flex items-center gap-4 cursor-pointer">
                <svg viewBox="0 0 24 24" width="18" height="18" color="#666">
                  <path
                    fill="currentColor"
                    d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.44 21.77,11.94 21.41,11.58Z"
                  ></path>
                </svg>{" "}
                Offers
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
