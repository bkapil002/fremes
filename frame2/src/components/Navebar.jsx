import { useState } from "react";
import {
  Home,
  Video,
  Users,
  User,
  Grid,
  MessageSquare,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { TbLogout, TbLogin2 } from "react-icons/tb";
import Z from "./Z.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
   const navigate = useNavigate()

  const {isAuthenticated, logout,user} = useAuth()

   const handleLogout = async () => {
    try {
      const response = await fetch("https://samzraa.onrender.com/api/users/logOut", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        logout();
        navigate('/signin');
        alert('Logged out successfully');
        
      } else {
        const errorData = await response.json();
        alert(`Logout failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to log out. Please try again.');
    } 
  };



  return (
    <nav className="bg-white shadow-sm px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={Z} alt="Logo" className="w-8 h-8 object-cover" />
        </div>

        {/* Center - Navigation Icons (Desktop only) */}
        <div className="hidden md:flex items-center gap-6">
          <Link to='/'><Home className="text-gray-600 cursor-pointer" /></Link>
          <Link to='/join'><Video className="text-gray-600 cursor-pointer" /></Link>
          <Users className="text-gray-600 cursor-pointer" />
          <User className="text-gray-600 cursor-pointer" />
          <Grid className="text-gray-600 cursor-pointer" />
        </div>

        {/* Right - Action Icons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ?(
            <Link to="/signin">
            <TbLogin2  className="text-gray-800 cursor-pointer text-2xl"/>
            </Link>
            ):(
             <>
             
          <TbLogout onClick={handleLogout} className="text-gray-800 text-2xl cursor-pointer" />
          <div className="relative">
            <MessageSquare className="text-gray-600 cursor-pointer" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          </div>
          <div className="relative">
            <Bell className="text-gray-600 cursor-pointer" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          </div>
          <img
            src={user?.imageUrls[0]}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
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
          <div className="flex justify-around">
            <Link to='/'><Home className="text-gray-600 cursor-pointer" /></Link>
          <Link to='/join'><Video className="text-gray-600 cursor-pointer" /></Link>
            <Users className="text-gray-600" />
            <User className="text-gray-600" />
            <Grid className="text-gray-600" />
          </div>

        
          {/* User actions */}
          <div className="flex justify-around items-center text-gray-700">
            {!isAuthenticated ?(
              <Link to="/signin">
            <TbLogin2  className=" text-2xl"/>
            </Link>
            ):(
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
              src={user?.imageUrls[0]}
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
