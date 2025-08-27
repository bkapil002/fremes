import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Trash2, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const Upcomming = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleteType, setDeleteType] = useState("this");

  useEffect(() => {
    if (!user) return;

    const fetchRooms = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
 
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
    <div className="flex p-2 flex-col items-center space-y-4">
      <h2 className="text-xl md:text-2xl -mt-3  font-bold text-center text-[#2A2A72]">
        Upcoming Meetings
      </h2>

      {loading ? (
        <div className=" w-full">
          {[...Array(4)].map((_, index) => (
            <div className="bg-gray-100 animate-pulse rounded-xl mt-2 p-2 w-full max-w-md shadow-lg">
              <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 w-16 bg-gray-300 rounded"></div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                  <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full ">
          {rooms.length > 0 ? (
            rooms.slice(0, 5).map((room) => (
              <div
                key={room._id}
                className="bg-gray-100 overflow-hidden shadow-2xl rounded-xl p-2 w-full mt-2 max-w-md"
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
                    className="py-1 px-4 rounded-[5px] bg-[#178a43] hover:bg-[#2A2A72] cursor-pointer  text-white text-xs md:text-sm transition-colors"
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
                              text: `Join this meeting: ${
                                room.meetingType
                              } on ${new Date(
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
            <p className="text-gray-500 text-sm text-center">No meetings yet</p>
          )}
        </div>
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
                className="bg-[#178a43] hover:bg-[#2A2A72] text-sm text-white px-4 py-1 rounded"
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
