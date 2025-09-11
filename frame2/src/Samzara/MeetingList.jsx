import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const MeetingList = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);

  const getWeekDays = () => {
    const today = new Date();
    let week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date
        .toLocaleString("en-US", { weekday: "short" })
        .toUpperCase();
      const dayNumber = String(date.getDate()).padStart(2, "0");
      week.push({
        label: ` ${dayNumber} ${dayName} `,
        dateOnly: date.toISOString().split("T")[0],
      });
    }
    return week;
  };

  const getStartTimeOnly = (timeStr) => {
    if (!timeStr) return timeStr;
    if (timeStr.includes(" - ")) {
      return timeStr.split(" - ")[0];
    }
    return timeStr;
  };

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return "";

    const [time, period] = timeStr.split(/\s+/);
    if (!time || !period) return timeStr;

    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);

    if (period.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const sortTimes = (times) => {
    return times.sort((a, b) => {
      const timeA = convertTo24Hour(a);
      const timeB = convertTo24Hour(b);
      return timeA.localeCompare(timeB);
    });
  };

  const isMeetingLive = (meetingTime) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const meeting24Hour = convertTo24Hour(meetingTime);

    const [meetingHours, meetingMinutes] = meeting24Hour.split(":").map(Number);
    const meetingTimeInMinutes = meetingHours * 60 + meetingMinutes;

    const [currentHours, currentMinutes] = currentTime.split(":").map(Number);
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    return (
      currentTimeInMinutes >= meetingTimeInMinutes &&
      currentTimeInMinutes <= meetingTimeInMinutes + 57
    );
  };

  const isMeetingUpcoming = (meetingTime) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const meeting24Hour = convertTo24Hour(meetingTime);

    return meeting24Hour > currentTime;
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get("https://samzraa.onrender.com/api/agora/all-rooms", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchRooms();

    const interval = setInterval(() => {
      fetchRooms();
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  const days = getWeekDays();
  const todayLabel = days[0].label;
  const todayDate = days[0].dateOnly;

  const todayMeetings = rooms.filter((room) => {
    const roomDate = new Date(room.meetingDate).toISOString().split("T")[0];
    return roomDate === todayDate;
  });

  const upcomingMeetings = todayMeetings
    .filter((room) => isMeetingUpcoming(room.meetingTime))
    .sort((a, b) => {
      const timeA = convertTo24Hour(a.meetingTime);
      const timeB = convertTo24Hour(b.meetingTime);
      return timeA.localeCompare(timeB);
    })
    .slice(0, 3);

  const liveMeetings = todayMeetings.filter((room) =>
    isMeetingLive(room.meetingTime)
  );
  const groupedData = {};
  rooms.forEach((room) => {
    const dateStr = new Date(room.meetingDate).toISOString().split("T")[0];
    if (!groupedData[room.meetingType]) {
      groupedData[room.meetingType] = {};
    }
    if (!groupedData[room.meetingType][dateStr]) {
      groupedData[room.meetingType][dateStr] = [];
    }
    groupedData[room.meetingType][dateStr].push(room.meetingTime);
  });

  Object.keys(groupedData).forEach((meetingType) => {
    Object.keys(groupedData[meetingType]).forEach((date) => {
      groupedData[meetingType][date] = sortTimes(
        groupedData[meetingType][date]
      );
    });
  });

  const getCurrentTimeCustom = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className=" mb-4">
      <div className="px-4 pt-2">
        <div className="w-full bg-[#f89939] rounded-md shadow-sm py-5 text-center">
          <h2 className="text-white text-xl md:text-2xl font-bold ">
            Online Meeting Schedule
          </h2>
          <div className=" ">
            <p className="text-white text-base font-medium   ">
              {days[0].label} To  {days[6].label}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings and On Air Section */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="text-black px-4 py-3 rounded-t-lg border-b-[1px] border-b-gray-300">
              <h3 className="text-lg font-semibold">On Air</h3>
            </div>
            <div className="p-4">
              {liveMeetings.length > 0 ? (
                <div
                  className={`space-y-3 ${
                    liveMeetings.length > 2 ? "max-h-60 overflow-y-auto" : ""
                  }`}
                >
                  {liveMeetings.map((meeting, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-md border-l-4 border-red-400"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {meeting.meetingType}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {meeting.meetingTime}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-xs text-red-600 font-medium">
                            LIVE
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/room/${meeting.linkId}`}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors animate-pulse"
                      >
                        Join Live
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No currently live</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md ">
            <div className=" text-white px-4 py-3 rounded-t-lg border-b-[1px] border-b-gray-300">
              <h3 className="text-lg text-black font-semibold">
                Upcoming Meetings
              </h3>
            </div>
            
            <div className="p-4">
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md border-l-4 border-[#272977]"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {meeting.meetingType}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {meeting.meetingTime}
                        </p>
                      </div>
                      <Link
                        to={`/room/${meeting.linkId}`}
                        className="bg-[#272977] hover:bg-[#178a43] text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Join
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No upcoming meetings today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Calendar View */}
      <div className="px-4 -mt-3 ">
        <div className="bg-gradient-to-r bg-white rounded-t-lg shadow-sm py-3  ">
          <div className=" pl-2">
            
            <h2 className="text-black  md:text-3xl text-xl flex items-center gap-1 font-semibold">
              <CalendarDays size={22} /> Full Calendar
            </h2>
            <div className="text-black py-1 rounded-t-lg border-b-[1px] border-b-gray-300"></div>
          </div>
          <div className="pl-3 -mt-1  py-1 flex justify-between">
            <p className="text-black md:text-base text-xs font-medium pt-3">
              {days[0].label} to {days[6].label}
            </p>
            <div className="mr-3 mt-2.5">
              <p className="text-black text-xs md:text-base font-medium">
                Your Local Time: {getCurrentTimeCustom()}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-b-lg">
          <table className="w-full  border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border text-sm md:text-lg font-normal border-gray-200 p-2 text-left">
                  Meeting
                </th>
                {days.map((day, index) => (
                  <th
                    key={index}
                    className="border md:text-lg  text-xs  font-normal border-gray-200 p-2 text-center"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedData).map((meetingType, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  <td className="border md:text-base text-xs border-gray-200 p-2 font-medium text-gray-700">
                    {meetingType}
                  </td>
                  {days.map((day, colIndex) => {
                    const times = groupedData[meetingType][day.dateOnly] || [];
                    return (
                      <td
                        key={colIndex}
                        className={`border border-gray-200 p-2 text-center ${
                          day.label === todayLabel
                            ? "bg-[#272977] text-white font-semibold"
                            : "text-[#272977]"
                        }`}
                      >
                        {times.length > 0
                          ? times.map((t, i) => (
                              <div key={i} className="text-xs md:text-base">
                                {getStartTimeOnly(t)}
                              </div>
                            ))
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeetingList;
