
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navebar from './components/Navebar'
import Frame from './Samzara/Frame'
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./components/Home";
import SideBar from "./Samzara/SideBar";
import MeetingList from "./Samzara/MeetingList";
import CreateMeeting from "./Samzara/CreateMetting";
import AttendanceRequests from "./pages/AttendanceRequests";
import Footer from "./components/Footer";
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "./context/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import AttendanceNavigate from "./components/AttendanceNavigate";

function App() {


  return (

   <AuthProvider>
      <Router>
        <Navebar />
        <div className="h-screen w-full  justify-center flex overflow-hidden">
          <div className=" flex w-320 2xl:w-295  overflow-hidden">
          <div className="">
            <SideBar />
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>
              {`
                .overflow-y-auto::-webkit-scrollbar { display: none; }
                .overflow-y-auto { -ms-overflow-style: none; scrollbar-width: none; }
              `}
            </style>

            {/* Page Content */}
            <div className="flex-1">
              <Routes>
                 <Route path="/:email" element={<Dashboard />} />
                <Route path="/signIn" element={<SignIn />} />
                <Route path="/user-attendance/:email" element={<AttendanceNavigate/>}/>
                {/* <Route path="/signin" element={<Navigate to="https://community.samzara.in/" replace />} /> */}
                {/* <Route path="/signup" element={<SignUp />} /> */}

                  <Route path="/" element={<ProtectedRoute><Navigate to="https://community.samzara.in" replace /></ProtectedRoute>} />
                  <Route path="/join" element={<ProtectedRoute><CreateMeeting /></ProtectedRoute>} />
                  <Route path="/room/:linkId" element={<ProtectedRoute><Frame /></ProtectedRoute>} />
                  <Route path="/meetingList" element={<ProtectedRoute><MeetingList /></ProtectedRoute>} />
                  <Route path="/attendance" element={<ProtectedRoute><AttendanceRequests /></ProtectedRoute>} />
              </Routes>
            </div>

            {/* Footer always at bottom */} 
            
          </div>
           <Toaster  position="top-center" reverseOrder={false} />
           
           </div>
           
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App
