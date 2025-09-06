
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {


  return (

   <AuthProvider>
      <Router>
        <Navebar />
        <div className="h-screen w-full  justify-center flex overflow-hidden">
          <div className=" flex w-320 overflow-hidden">
          <div >
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
                <Route path="/" element={<Home />} />
                <Route path="/join" element={<CreateMeeting />} />
                <Route path="/room/:linkId" element={<Frame />} />
                <Route path="/mleetingList" element={<MeetingList />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/attendance" element={<AttendanceRequests />} />
              </Routes>
            </div>

            {/* Footer always at bottom */} 
            <Footer />
          </div>
           <Toaster  position="top-center" reverseOrder={false} />
           </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
