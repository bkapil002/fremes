import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Trash2, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const Upcomming = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleteType, setDeleteType] = useState("this");

  useEffect(() => {
    if (!user) return;

    const fetchRooms = async () => {
      try {
        const res = await axios.get(
          "https://samzraa.onrender.com/api/agora/Upcomeing-rooms",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setRooms(res.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // ✅ handle confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedRoom) return;
    try {
      if (deleteType === "this") {
        await axios.delete(
          `https://samzraa.onrender.com/api/agora/delete-room/${selectedRoom.linkId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else if (deleteType === "all") {
        await axios.delete(
          `https://samzraa.onrender.com/api/agora/delete-upcoming/${selectedRoom.linkId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      // remove from UI
      setRooms((prev) =>
        prev.filter((room) => room.linkId !== selectedRoom.linkId)
      );
      setShowModal(false);
      setSelectedRoom(null);
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
   
      <h2 className="text-lg font-semibold text-center text-[#2A2A72]">Upcoming Meetings</h2>

      {/* Meeting Cards */}
      {rooms.length > 0 ? (
        rooms.slice(0, 5).map((room) => (
          <div
            key={room._id}
            className="bg-white overflow-hidden shadow-lg rounded-xl p-2 w-full max-w-md"
          >
            <h2 className="text-lg font-medium md:text-xl text-[#2A2A72]">
              {room.meetingType}
            </h2>
            <div className="text-[12px] md:text-xs flex text-gray-500 gap-2">
              <p>
                {new Date(room.meetingDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p>{room.meetingTime}</p>
            </div>

            <div className="flex pr-2 justify-between text-center gap-1 mt-3">
              <Link
                to={`/room/${room.linkId}`}
                className="py-1 px-4 rounded-full bg-[#2A2A72] cursor-pointer hover:bg-blue-700 text-white text-xs md:text-sm transition-colors"
              >
                Join
              </Link>
              <div className="flex text-center gap-3">
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowModal(true);
                  }}
                  className="cursor-pointer text-red-600"
                >
                  <Trash2 size={17} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: "Join My Meeting",
                          text: `Join this meeting: ${room.meetingType} on ${new Date(
                            room.meetingDate
                          ).toLocaleDateString()}`,
                          url: `${window.location.origin}/room/${room.linkId}`,
                        })
                        .catch((err) =>
                          console.log("Share cancelled", err)
                        );
                    } else {
                      alert("Sharing is not supported on this browser.");
                    }
                  }}
                  className="cursor-pointer text-[#2A2A72]"
                >
                  <Share2 size={17} />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No meetings yet</p>
      )}

      {/* Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg shadow-lg w-80 p-5">
            <h3 className="text-lg font-semibold mb-4">
              Delete recurring event
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delete"
                  checked={deleteType === "this"}
                  onChange={() => setDeleteType("this")}
                />
                <span>This event</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delete"
                  checked={deleteType === "all"}
                  onChange={() => setDeleteType("all")}
                />
                <span>All events</span>
              </label>
            </div>
            <div className="flex justify-end gap-4 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="text-[#2A2A72] text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-[#2A2A72] text-sm text-white px-4 py-1 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upcomming;
