import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import { Link } from "react-router-dom";
import meeting from "./Date-meeting"

const meetingTypes = meeting.types;
const timeSlots = meeting.slots;
const getNext7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
};

const parseTime = (timeSlot) => {
  const [time, modifier] = timeSlot.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '0';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
};

// Updated function to check if meeting has ended (based on end time)
const isMeetingInPast = (meetingDate, meetingTime) => {
  // Check if meetingTime contains " - " (duration format)
  let endTimeString;
  if (meetingTime.includes(' - ')) {
    // Extract end time from duration format like "3:00 PM - 4:00 PM"
    endTimeString = meetingTime.split(' - ')[1];
  } else {
    // If no duration format, assume 1-hour meeting
    const { hours, minutes } = parseTime(meetingTime);
    const endHour = hours + 1;
    const endModifier = endHour >= 12 ? 'PM' : 'AM';
    const displayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
    endTimeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${endModifier}`;
  }
  
  const { hours: endHours, minutes: endMinutes } = parseTime(endTimeString);
  const meetingEndDateTime = new Date(meetingDate);
  meetingEndDateTime.setHours(endHours, endMinutes);
  
  return meetingEndDateTime <= new Date();
};

const CreateMeeting = () => {
  const { user } = useAuth();
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [customMeetingType, setCustomMeetingType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [error, setError] = useState("");
  const [bookedTimes, setBookedTimes] = useState([]);
  const [previousMeetings, setPreviousMeetings] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const dates = getNext7Days();
  const finalMeetingName = selectedMeeting === "Other" ? customMeetingType : selectedMeeting;

  useEffect(() => {
    if (!user) return;
    const fetchBookedTimes = async () => {
      if (!selectedDate) return;
      try {
        const formattedDate = selectedDate.toISOString().split("T")[0];
        const res = await axios.get(
          `https://samzraa.onrender.com/api/agora/meeting-time/${formattedDate}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setBookedTimes(res.data.bookedTimes || []);
      } catch (err) {
        console.error("Error fetching booked times:", err);
        setBookedTimes([]);
      }
    };
    fetchBookedTimes();
  }, [selectedDate, user]);

  useEffect(() => {
    if (!user) return;
    const fetchPreviousMeetings = async () => {
      try {
        const res = await axios.get(
          "https://samzraa.onrender.com/api/agora/rooms",
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setPreviousMeetings(res.data || []);
      } catch (err) {
        console.error("Error fetching previous meetings:", err);
      }
    };
    fetchPreviousMeetings();
  }, [user]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }
    const now = new Date();
    const selected = new Date(selectedDate);
    if (selected.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const filteredTimeSlots = timeSlots.filter(slot => {
        const { hours, minutes } = parseTime(slot.split(' - ')[0]);
        return hours > currentHour || (hours === currentHour && minutes > currentMinute);
      });
      setAvailableTimeSlots(filteredTimeSlots);
    } else {
      setAvailableTimeSlots(timeSlots);
    }
  }, [selectedDate]);

  const handleCreateRoom = async () => {
    if (!finalMeetingName || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://samzraa.onrender.com/api/agora/create-room",
        {
          meetingType: finalMeetingName,
          meetingDate: selectedDate.toISOString().split("T")[0],
          meetingTime: selectedTime,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCreatedRoom(res.data);
      
      // Show success message briefly before reloading
      setTimeout(() => {
        window.location.reload();
      }, 1000); 
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create meeting");
      setLoading(false); // Only set loading to false on error
    }
  };

  const pastMeetings = previousMeetings.filter(m => isMeetingInPast(m.meetingDate, m.meetingTime));

  const upcomingMeetings = previousMeetings
    .filter(m => !isMeetingInPast(m.meetingDate, m.meetingTime))
    .sort((a, b) => {
      const { hours: hoursA, minutes: minutesA } = parseTime(a.meetingTime.split(' - ')[0]);
      const { hours: hoursB, minutes: minutesB } = parseTime(b.meetingTime.split(' - ')[0]);

      const dateTimeA = new Date(a.meetingDate);
      dateTimeA.setHours(hoursA, minutesA);

      const dateTimeB = new Date(b.meetingDate);
      dateTimeB.setHours(hoursB, minutesB);

      return dateTimeA - dateTimeB;
    });

  return (
    <div className="min-h-screen flex flex-col items-center px-2 py-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-2xl font-bold text-[#2A2A72] text-center mb-6">
            Create a New Meeting
          </h1>
          <div>
            <label className="text-[#3C3C3C] text-sx font-semibold mb-1 block">
              Select Meeting Type:
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 max-h-40 overflow-y-auto sm:text-base text-sm"
                value={selectedMeeting}
                onChange={(e) => {
                  setSelectedMeeting(e.target.value);
                  setSelectedDate(null);
                  setSelectedTime("");
                  setCustomMeetingType("");
                }}
                size={1}
              >
                <option value="">-- Choose --</option>
                {meetingTypes.map((type, i) => (
                  <option key={i} value={type} className="truncate">
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {selectedMeeting === "Other" && (
              <input
                type="text"
                placeholder="Enter custom meeting type"
                className="mt-3 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={customMeetingType}
                onChange={(e) => setCustomMeetingType(e.target.value)}
              />
            )}
          </div>
          {finalMeetingName && (
            <div>
              <label className="text-[#3C3C3C] text-sm font-semibold mb-1 block">
                Choose a Day:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {dates.map((date, i) => {
                  const formatted = date.toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime("");
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                        selectedDate?.toDateString() === formatted
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-white text-gray-800 hover:bg-indigo-100 border-gray-300"
                      }`}
                    >
                      {formatted}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedDate && (
            <div>
              <label className="text-[#3C3C3C] text-sm font-semibold mb-1 block">
                Choose a Time:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableTimeSlots.map((slot, i) => {
                  const isBooked = bookedTimes.includes(slot);
                  return (
                    <button
                      key={i}
                      onClick={() => !isBooked && setSelectedTime(slot)}
                      disabled={isBooked}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                        isBooked
                          ? "bg-red-200 text-red-700 border-red-300 cursor-not-allowed"
                          : selectedTime === slot
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white text-gray-800 hover:bg-indigo-100 border-gray-300"
                      }`}
                    >
                      {slot}
                      {isBooked && <span className="block text-xs">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedTime && finalMeetingName && (
            <div className="mt-6 p-4 border border-indigo-300 bg-indigo-50 rounded-xl shadow-sm">
              <h2 className="text-#2A2A72 font-semibold text-lg mb-2">
                Meeting Details
              </h2>
              <p className="text-gray-700">
                <span className="font-semibold">Type:</span> {finalMeetingName}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Date:</span> {selectedDate.toDateString()}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Time:</span> {selectedTime}
              </p>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className={`mt-4 w-full rounded-lg py-2 font-semibold transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-[#2A2A72] text-white cursor-pointer hover:bg-[#000080]"
                }`}
              >
                {loading ? "Creating..." : "Create Meeting Room"}
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          )}
          {createdRoom && (
            <div className="mt-6 p-4 border border-green-300 bg-green-50 rounded-xl shadow-sm">
              <h2 className="text-green-800 font-semibold text-lg mb-2">
                Room Created Successfully! Refreshing...
              </h2>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white w-full rounded-2xl shadow-2xl sm:p-8">
        <h2 className="text-xl sm:text-1xl font-bold text-[#2A2A72] mb-4 text-center">
          Upcoming Meetings
        </h2>
        {upcomingMeetings.length === 0 && (
          <p className="text-center text-gray-500">No upcoming meetings found.</p>
        )}
        <ul className="space-y-3 max-h-90 overflow-y-auto">
          {upcomingMeetings.map((m) => (
            <li
              key={m.linkId}
              className="border border-indigo-300 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div className="truncate text-sm sm:flex-1">
                <p className="text-[#2A2A72] font-semibold truncate">
                  Meeting: {m.meetingType}
                </p>
                <p className="text-gray-700  text-sm truncate">
                  {(() => {
                    const date = new Date(m.meetingDate);
                    const day = date.getDate();
                    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    const year = date.getFullYear();
                    return `${day}, ${weekday} ${month} ${year}`;
                  })()}
                </p>
                <p className="text-[#3C3C3C] text-sm truncate">
                  Time: {m.meetingTime}
                </p>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-3">
                <Link
                  to={`/room/${m.linkId}`}
                  className="px-3  bg-[#2A2A72] text-sm text-white rounded-lg hover:bg-[#000080]"
                  aria-label={`Join meeting room ${m.meetingType} on ${m.meetingDate}`}
                >
                  Join
                </Link>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Join My Meeting",
                        text: `Join this meeting: ${m.meetingType} on ${new Date(m.meetingDate).toLocaleDateString()}`,
                        url: `${window.location.origin}/room/${m.linkId}`,
                      }).catch((err) => console.log("Share cancelled", err));
                    } else {
                      alert("Sharing is not supported on this browser.");
                    }
                  }}
                  className="bg-[#2A2A72] hover:bg-[#000080] text-white px-3 cursor-pointer  rounded-lg  text-sm"
                >
                  Share
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axios.delete(
                        `https://samzraa.onrender.com/api/agora/delete-room/${m.linkId}`,
                        { headers: { Authorization: `Bearer ${user.token}` } }
                      );
                      setPreviousMeetings((prev) =>
                        prev.filter((room) => room.linkId !== m.linkId)
                      );
                    } catch (err) {
                      console.error("Failed to delete room", err);
                      alert("Failed to delete room");
                    }
                  }}
                  className="px-3  bg-red-600 text-sm text-white rounded-lg hover:bg-red-700"
                  aria-label={`Delete meeting room ${m.meetingType} on ${m.meetingDate}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white w-full rounded-2xl shadow-2xl  sm:p-8 mt-6">
        <h2 className="text-xl sm:text-1xl font-bold text-[#2A2A72] mb-4 text-center">
          Previous  Meetings
        </h2>
        {pastMeetings.length === 0 && (
          <p className="text-center text-gray-500">No Previous  Meetings Found.</p>
        )}
        <ul className="space-y-3 max-h-96 overflow-y-auto">
          {pastMeetings.map((m) => (
            <li
              key={m.linkId}
              className="border border-gray-300 bg-gray-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div className="truncate text-sm  sm:flex-1">
                <p className="text-[#2A2A72] font-semibold truncate">
                  Meeting: {m.meetingType}
                </p>
                <p className="text-[#3C3C3C] text-sm truncate">
                  {(() => {
                    const date = new Date(m.meetingDate);
                    const day = date.getDate();
                    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    const year = date.getFullYear();
                    return `${day}, ${weekday} ${month} ${year}`;
                  })()}
                </p>
                <p className="text-[#3C3C3C] text-sm truncate">
                  Time: {m.meetingTime}
                </p>
                <p className="text-red-500 text-sm font-semibold">Previous  Meeting</p>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-3">
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreateMeeting;