import { use } from "react";
import { useAuth } from "../context/AuthContext";
const Home = () => {
  const {user} = useAuth()
  return (
    <div className='h-screen w-full justify-center text-center  flex items-center'>
      <p className='text-6xl'>Hello,{user?.name}</p>
    </div>
  )
}

export default Home
