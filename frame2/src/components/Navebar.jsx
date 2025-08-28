import { useState } from "react";
import { MessageSquare, Bell, Menu, X } from "lucide-react";
import { TbLogout, TbLogin2 } from "react-icons/tb";
import Z from "./LOGO.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search } from "lucide-react";

export default function Navebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://samzraa.onrender.com/api/users/logOut",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        logout();
        navigate("/signin");
        alert("Logged out successfully");
      } else {
        const errorData = await response.json();
        alert(`Logout failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const [query, setQuery] = useState("");

  return (
    <nav className="bg-gray-200 shadow-sm px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center ">
          <img src={Z} alt="Logo" className=" w-30 md:w-40 object-cover" />
        </div>

        {/* Center - Navigation Icons (Desktop only) */}
        <div className=" hidden md:flex justify-center items-center  ">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 w-96 shadow-sm">
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
        <div className="hidden md:flex pr-[239px] items-center gap-4">
          {!isAuthenticated ? (
            <Link to="/signin">
              <TbLogin2 className="text-gray-800 cursor-pointer text-2xl" />
            </Link>
          ) : (
            <>
              <TbLogout
                onClick={handleLogout}
                size={20}
                className="text-gray-800 text-xl cursor-pointer"
              />
              <div className="relative">
                <MessageSquare
                  size={20}
                  className="text-gray-600  cursor-pointer"
                />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              </div>
              <div className="relative">
                <Bell className="text-gray-600 cursor-pointer" size={20} />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              </div>
              <img
                src={
                  user?.imageUrls[0] ||
                  "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                }
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
              />
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-full hover:bg-gray-100"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 animate-slide-down">
          {/* Center nav icons */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 w-80 shadow-sm">
            <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ml-2 w-full outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* User actions */}
          <div className="flex justify-around items-center text-gray-700">
            {!isAuthenticated ? (
              <Link to="/signin">
                <TbLogin2 className=" text-2xl" />
              </Link>
            ) : (
              <>
                <TbLogout onClick={handleLogout} className="text-2xl" />
                <div className="relative">
                  <MessageSquare className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                </div>
                <div className="relative">
                  <Bell className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                </div>
                <img
                  src={
                    user?.imageUrls[0] ||
                    "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                  }
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
