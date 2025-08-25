import React, { useState } from 'react'
import { X ,Menu } from "lucide-react";

import { Link } from 'react-router-dom';

const SideBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
     <div className=''>
       <ul className=" text-gray-700 font-medium">
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link to={'/'} className="flex items-center gap-2">
            <i className="ri-home-2-line  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Home</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link to={'/'} className="flex items-center gap-2">
            <i className="ri-profile-line  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Profile</p>
            </Link>
          </li>
           <li   className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link to={'/join'} className="flex items-center gap-2">
            <i className="ri-video-add-line text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Create Meeting</p>
            </Link>
          </li>
          <li   className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link to={'/mleetingList'} className="flex items-center gap-2">
            <i className="ri-video-on-line  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Online Meeting</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link className="flex items-center gap-2">
            <i className="ri-group-line  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Groups</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link to={'/attendanc'} className="flex items-center gap-2">
            <i className="ri-user-follow-line  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Attendance</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link className="flex items-center gap-2">
            <i className=" ri-hotel-line text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Find a Centre</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link className="flex items-center gap-2">
            <i className="ri-calendar-event-line  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Events</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link className="flex items-center gap-2">
            <i className="ri-user-community-line  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Fellowships</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link className="flex items-center gap-2">
            <i className="ri-question-mark  text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>FAQ's</p>
            </Link>
          </li>
          <li  className="flex items-center gap-3 p-2 hover:bg-gray-100 text-gray-500  font-normal text-sm rounded cursor-pointer transition" >
            <Link className="flex items-center gap-2">
            <i className="ri-rss-line text-blue-900 text-xl"></i> 
             <p className='text-black text-base'>Blogs</p>
            </Link>
          </li>  
      </ul>
      </div>
    </div>
    </>
  )
}

export default SideBar
