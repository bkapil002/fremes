import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    const res = await API.post("/room/create", { email });
    navigate(`/call/${res.data.channel}?uid=${email}`);
  };

  return (
    <div className="p-4">
      <h2>Create Room</h2>
      <input className="border p-2 mr-2" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
      <button className="bg-green-600 text-white px-4 py-2" onClick={createRoom}>Create</button>
    </div>
  );
}
