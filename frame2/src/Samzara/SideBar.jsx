import React, { useState, useRef, useEffect } from 'react';
import { X, Menu } from "lucide-react";
import { Link } from 'react-router-dom';

const SideBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-16   md:hidden z-50">
        <button className=' bg-gray-200 rounded-[3px] py-1 px-1' onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed md:static top-0 left-0 h-full shadow-lg w-60 p-4 bg-gray-200 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Close Button (Mobile) */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <ul className="text-gray-700 font-medium">
          {[
            { to: "/", icon: "ri-home-2-line", text: "Home" },
            { to: "/", icon: "ri-profile-line", text: "Profile" },
            { to: "/join", icon: "ri-video-add-line", text: "Create Meeting" },
            { to: "/mleetingList", icon: "ri-video-on-line", text: "Online Meeting" },
            { to: "/groups", icon: "ri-group-line", text: "Groups" },
            { to: "/attendance", icon: "ri-user-follow-line", text: "Attendance" },
            { to: "/centre", icon: "ri-hotel-line", text: "Find a Centre" },
            { to: "/events", icon: "ri-calendar-event-line", text: "Events" },
            { to: "/fellowships", icon: "ri-user-community-line", text: "Fellowships" },
            { to: "/faq", icon: "ri-question-mark", text: "FAQ's" },
            { to: "/blogs", icon: "ri-rss-line", text: "Blogs" }
          ].map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500 font-normal text-sm rounded cursor-pointer transition"
              onClick={() => setSidebarOpen(false)} // Close on click
            >
              <Link to={item.to} className="flex items-center gap-2">
                <i className={`${item.icon} text-blue-900 text-xl`}></i>
                <p className="text-black text-base">{item.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SideBar;



















