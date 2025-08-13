import React, { useState } from 'react'
import {ChevronDown, X ,Menu } from "lucide-react";
import profile from "./image/profile.png";
import video from "./image/video.png";
import follow from "./image/follow.png";
import discussion from "./image/disecussion.png";
import meeting from "./image/meeting.png";
import center from "./image/center.png";
import doctor from "./image/doctor.png";
import member from "./image/member.png";
import setting from "./image/setting.png";
import { Link } from 'react-router-dom';

const SideBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
      const [resourcesOpen, setResourcesOpen] = useState(false);
  return (
    <>
       <div className="fixed   transform   md:hidden ">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
    <div className={`fixed md:static top-0 left-0 h-full shadow-lg w-60 p-4 bg-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      
      <div className="flex justify-between items-center mb-6 md:hidden">
        <button onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>
     </div>
       <ul className="space-y-2 text-gray-700 font-medium">
        {[
          { icon: profile, text: "My Profile" ,path:""},
          { icon: video, text: "Create Meeting", path:"/join"},
          { icon: video, text: "Online Meeting", path:"/mleetingList"},
          { icon: follow, text: "Fellowships" ,path:""},
          { icon: discussion, text: "Discussions" },
          { icon: meeting, text: "Meeting Finder" },
          { icon: center, text: "Find a Centre" },
          { icon: doctor, text: "Search a Doctor" },
        ].map((item, idx) => (
          <li key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link to={item.path} className="flex items-center gap-3">
            <img className="w-5 h-5 object-contain" src={item.icon} alt={item.text} />
            {item.text}
            </Link>
          </li>
        ))}

        {/* Members Dropdown */}
        <li>
          <div
            className="flex items-center justify-between p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => setMembersOpen(!membersOpen)}
          >
            <div className="flex items-center text-sm gap-3">
              <img className="w-5 h-5" src={member} alt="Members" /> Members
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                membersOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          {membersOpen && (
            <ul className="pl-10 mt-1 text-sm space-y-1 text-gray-500">
              <li className="hover:text-gray-700 cursor-pointer">Member 1</li>
              <li className="hover:text-gray-700 cursor-pointer">Member 2</li>
            </ul>
          )}
        </li>

        {/* Resources Dropdown */}
        <li>
          <div
            className="flex items-center justify-between p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => setResourcesOpen(!resourcesOpen)}
          >
            <div className="flex items-center gap-3 text-sm">
              <img className="w-5 h-5" src={setting} alt="Resources" /> Resources
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                resourcesOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          {resourcesOpen && (
            <ul className="pl-10 mt-1 text-sm space-y-1 text-gray-500">
              <li className="hover:text-gray-700 cursor-pointer">
                Daily Meditations
              </li>
              <li className="hover:text-gray-700 cursor-pointer">
                Audio & Video Tapes
              </li>
              <li className="hover:text-gray-700 cursor-pointer">
                News & Blogs
              </li>
              <li className="hover:text-gray-700 cursor-pointer">
                Technical Support
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
    </>
  )
}

export default SideBar
