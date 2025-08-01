
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navebar from './components/Navebar'
import Frame from './Samzara/Frame'
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import JoinRoom from "./pages/JoinRoom";
import Home from "./components/Home";

function App() {
  

  return (

    <AuthProvider>
    <Router>
      <Navebar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/room/:linkId" element={<Frame/>} />
        <Route path='/signin' element={<SignIn/>}/>
        <Route path= '/signup' element={<SignUp/>}/>
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App
