
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Mic, MicOff,Camera ,CameraOff , Menu } from "lucide-react";
import Navebar from './components/Navebar'
import Frame from './Samzara/Frame'
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import JoinRoom from "./pages/JoinRoom";
import Home from "./components/Home";
import SideBar from "./Samzara/SideBar";
import { useState } from "react";
import MeetingList from "./Samzara/MeetingList";
import CreateMeeting from "./Samzara/CreateMetting";
import AttendanceRequests from "./pages/AttendanceRequests";

function App() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

  return (

    <AuthProvider>
    <Router>
      <Navebar/>
      <div className="h-screen flex overflow-hidden">

       <div className="mt-1">
        <SideBar/>
       </div>
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
         <style>
          {`
            .overflow-y-auto::-webkit-scrollbar { display: none; }
            .overflow-y-auto { -ms-overflow-style: none; scrollbar-width: none; }
          `}
        </style>
        
       <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/join" element={<CreateMeeting />} />
        <Route path="/room/:linkId" element={<Frame/>} />
        <Route path= '/mleetingList' element={<MeetingList/>}/>
        <Route path='/signin' element={<SignIn/>}/>
        <Route path= '/signup' element={<SignUp/>}/>
        <Route path="/attendanc" element={<AttendanceRequests />} />
      </Routes>
      </div>
      
      </div>
    </Router>
    </AuthProvider>
  )
}

export default App
