import React from "react";
import { ChevronDown, X } from "lucide-react";
import profile from "./image/profile.png";
import video from "./image/video.png";
import follow from "./image/follow.png";
import discussion from "./image/disecussion.png";
import meeting from "./image/meeting.png";
import center from "./image/center.png";
import doctor from "./image/doctor.png";
import member from "./image/member.png";
import setting from "./image/setting.png";

const SideBar = ({
  membersOpen,
  setMembersOpen,
  resourcesOpen,
  setResourcesOpen,
  setSidebarOpen,
}) => {
  return (
    <div>
      {/* Mobile Header */}
      <div className="flex justify-between items-center mb-6 md:hidden">
        <button onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>
      </div>

      {/* Menu List */}
      <ul className="space-y-2 text-gray-700 font-medium">
        {/* Static Menu Items */}
        {[
          { icon: profile, text: "My Profile" },
          { icon: video, text: "Online Meeting" },
          { icon: follow, text: "Fellowships" },
          { icon: discussion, text: "Discussions" },
          { icon: meeting, text: "Meeting Finder" },
          { icon: center, text: "Find a Centre" },
          { icon: doctor, text: "Search a Doctor" },
        ].map((item, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 p-2 hover:bg-gray-200 text-gray-500 font-normal text-base rounded cursor-pointer transition"
          >
            <img className="w-5 h-5 object-contain" src={item.icon} alt={item.text} />
            {item.text}
          </li>
        ))}

        {/* Members Dropdown */}
        <li>
          <div
            className="flex items-center justify-between p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => setMembersOpen(!membersOpen)}
          >
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-3">
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
  );
};

export default SideBar;
