import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Upcomming from "./Upcomming";
import meeting from "./Date-meeting";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);


const SimpleDatePicker = ({ selectedDate, onDateChange, minDate, onClose }) => {

  const getInitialMonth = (d) => {
    const date = d ? new Date(d) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(selectedDate));

 
  useEffect(() => {
    if (selectedDate) setCurrentMonth(getInitialMonth(selectedDate));
  }, [selectedDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return (
      date &&
      selectedDate &&
      date.toDateString() === new Date(selectedDate).toDateString()
    );
  };

  const isDisabled = (date) => {
    if (!date || !minDate) return false;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return d < min;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <button
          aria-label="Previous month"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>

        <button
          aria-label="Next month"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 p-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (day && !isDisabled(day)) {
                
                const timePreserved = new Date(day);
                if (selectedDate instanceof Date) {
                  timePreserved.setHours(selectedDate.getHours());
                  timePreserved.setMinutes(selectedDate.getMinutes());
                  timePreserved.setSeconds(selectedDate.getSeconds());
                }
                onDateChange(timePreserved);
                if (onClose) onClose();
              }
            }}
            disabled={!day || isDisabled(day)}
            className={`p-2 text-sm rounded transition-colors ${!day ? "invisible" : ""} ${
              isSelected(day) ? "bg-[#2A2A72] text-white hover:bg-[#2A2A72]" : ""
            } ${isToday(day) && !isSelected(day) ? "bg-blue-100 text-[#2A2A72]" : ""} ${
              isDisabled(day) ? "text-gray-300 cursor-not-allowed hover:bg-transparent" : ""
            }`}
          >
            {day ? day.getDate() : ""}
          </button>
        ))}
      </div>
    </div>
  );
};

// -----------------------
// CreateMeeting (main)
// -----------------------
const CreateMeeting = () => {
  const meetingSuggestions = meeting.types;
  const timeSlots = meeting.slots;

  const { user } = useAuth();
  const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [repeat, setRepeat] = useState("Does not repeat");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeRef = useRef(null);
  const repeatRef = useRef(null);
  const datePickerRef = useRef(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [selectedRoom, setSelectedRoom] = useState(null);
    const [deleteType, setDeleteType] = useState("this");

  const handleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    if (value.trim().length > 0) {
      const filtered = meetingSuggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()));
      setFilteredSuggestions(filtered);
    } else setFilteredSuggestions([]);
  };

  const handleSelect = (suggestion) => {
    setTitle(suggestion);
    setFilteredSuggestions([]);
  };

  const fetchUpcomingMeetings = async () => {
    if (!user) return;
    try {
      const response = await axios.get("https://samzraa.onrender.com/api/agora/Upcomeing-rooms", { headers: { Authorization: `Bearer ${user.token}` } });
      setUpcomingMeetings(response.data);
    } catch (error) {
      console.error("Error fetching upcoming meetings:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUpcomingMeetings();
    const interval = setInterval(fetchUpcomingMeetings, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const getMeetingForSlot = (day, timeSlot) => {
    return upcomingMeetings.find((m) => {
      const meetingDate = dayjs(m.meetingDate);
      return meetingDate.isSame(day, "day") && m.meetingTime === timeSlot;
    });
  };

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  useEffect(() => {
    if (!startDate) {
      setAvailableTimeSlots([]);
      return;
    }
    setAvailableTimeSlots(timeSlots);
    if (!timeSlots.includes(selectedSlot) && timeSlots.length > 0) setSelectedSlot(timeSlots[0]);
  }, [startDate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (timeRef.current && !timeRef.current.contains(event.target)) setIsTimeOpen(false);
      if (repeatRef.current && !repeatRef.current.contains(event.target)) setIsOpen(false);
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) setShowDatePicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getWeekday = (date) => dayjs(date).format("dddd");
  const getWeekOfMonth = (date) => {
    const d = dayjs(date);
    const dayOfWeek = d.day();
    const dayOfMonth = d.date();
    const firstDayOfMonth = d.startOf("month");
    const firstOccurrence = 1 + ((7 + dayOfWeek - firstDayOfMonth.day()) % 7);
    const weekIndex = Math.ceil((dayOfMonth - firstOccurrence + 1) / 7);
    const ordinals = ["first", "second", "third", "fourth", "fifth"];
    return ordinals[weekIndex - 1] || "";
  };
  const getRepeatLabel = (option, date) => {
    if (option === "Weekly") return `Weekly on ${getWeekday(date)}`;
    if (option === "Monthly") return `Monthly on the ${getWeekOfMonth(date)} ${getWeekday(date)}`;
    return option;
  };

  const handleSave = async () => {
    if (!title) return alert("Please enter a meeting title");
     if (!description) return toast.error("Please enter a meeting Description");

    const localDate = dayjs(startDate).hour(parseTime(selectedSlot).hours).minute(parseTime(selectedSlot).minutes).second(0);
    const istDate = localDate.tz("Asia/Kolkata").format();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://samzraa.onrender.com/api/agora/create-room",
        {
          meetingType: title,
          meetingDate: istDate,
          meetingTime: selectedSlot,
          meetingRepeat: repeat,
          meetingDescription: description,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      console.log("Meeting Created:", res.data);
      toast.success("Meeting Created Successfully ");
      setTitle("");
      setStartDate(new Date());
      setSelectedSlot(timeSlots[0]);
      setRepeat("Does not repeat");
      window.location.reload();
    } catch (error) {
      console.error("Error creating meeting:", error.response?.data || error);
      toast.error("Failed to create meeting ");
    } finally {
      setLoading(false);
    }
  };

  // Calendar state
  const [currentDate, setCurrentDate] = useState(dayjs(startDate));
  const [view, setView] = useState("week");
  const [dragging, setDragging] = useState(null);
  const [selectedHour, setSelectedHour] = useState(parseTime(selectedSlot).hours);

  useEffect(() => setCurrentDate(dayjs(startDate)), [startDate]);
  useEffect(() => setSelectedHour(parseTime(selectedSlot).hours), [selectedSlot]);

  const getDays = () => {
    if (view === "day") return [currentDate];
    if (view === "3days") return [currentDate, currentDate.add(1, "day"), currentDate.add(2, "day")];
    return Array.from({ length: 7 }, (_, i) => currentDate.startOf("week").add(i, "day"));
  };

  const daysArr = getDays();
  const goToday = () => setCurrentDate(dayjs());
  const goPrev = () => setCurrentDate(view === "day" ? currentDate.subtract(1, "day") : view === "3days" ? currentDate.subtract(3, "day") : currentDate.subtract(1, "week"));
  const goNext = () => setCurrentDate(view === "day" ? currentDate.add(1, "day") : view === "3days" ? currentDate.add(3, "day") : currentDate.add(1, "week"));

  const handleMouseDown = (day, hour) => setDragging({ day, startHour: hour, endHour: hour });
  const handleMouseEnter = (day, hour) => { if (dragging && dragging.day.isSame(day, "day")) setDragging({ ...dragging, endHour: hour }); };
  const handleMouseUp = () => { if (dragging) setDragging(null); };

  const formatHour = (timeStr) => {
    const { hours } = parseTime(timeStr);
    const date = new Date();
    date.setHours(hours, 0, 0, 0);
    return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  };

  const [startTime, endTime] = selectedSlot.split(" - ");
  const handleDeleteConfirm = async () => {
    if (!selectedRoom) return;
    setIsLoading(true)
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

      setUpcomingMeetings((prev) =>
        prev.filter((room) => room.linkId !== selectedRoom.linkId)
      );
      setShowModal(false);
      setSelectedRoom(null);
      toast.success("Deleted ")
      window.location.reload();
    } catch (err) {
      toast.error('Meeting is not Deleted')
      console.error("Error deleting room:", err);
    }finally{
      setIsLoading(false)
    }
  };

  return (
    <div className="w-full min-h-screen mt-1 p-4 sm:p-6 md:p-6 md:rounded-2xl">
      {/* Create Meeting Section */}
       <div className="bg-white flex -mt-2 flex-col lg:flex-row w-full rounded-xl shadow-sm p-6 sm:p-8 mb-6 gap-8">
        {/* Left Section - Form Inputs */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          <div className="space-y-6">
            {/* Meeting Title Section */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={handleChange}
                  className="border-b-2 border-gray-300 w-full text-gray-800 text-base sm:text-lg lg:text-xl outline-none focus:border-[#2A2A72] transition-colors pb-3 bg-transparent hover:border-gray-400"
                  placeholder="Enter meeting title..."
                />
                {title && (
                  <button
                    type="button"
                    onClick={() => setTitle("")}
                    className="absolute cursor-pointer right-0 bottom-2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={18} />
                  </button>
                )}

                {filteredSuggestions.length > 0 && (
                  <ul className="absolute left-0 top-full mt-2 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-50 backdrop-blur-sm">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelect(suggestion)}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 text-gray-800 text-sm sm:text-base transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Meeting Description Section */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={150}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 text-base sm:text-lg outline-none focus:border-[#2A2A72] transition-all duration-200 resize-none hover:border-gray-300 shadow-sm focus:shadow-md"
                  placeholder="Add meeting description..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {150 - description.length}
                </div>
              </div>
            </div>

            {/* Save Button */}
          </div>
        </div>

        {/* Right Section - Date/Time/Repeat */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          <div className=" rounded-xl space-y-4">
            <div className="relative" ref={datePickerRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Date
              </label>
              <button
                onClick={() => setShowDatePicker((s) => !s)}
                className="w-full rounded-lg bg-white border-1 border-gray-200 text-[#3C3C3C] hover:border-gray-300 focus:border-[#2A2A72] px-4 py-3 md:text-sm text-xs transition-all duration-200 outline-none shadow-sm hover:shadow-md flex items-center justify-between"
              >
                <span className="font-medium">
                  {startDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDatePicker && (
                <SimpleDatePicker
                  selectedDate={startDate}
                  onDateChange={setStartDate}
                  minDate={new Date()}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>

            {/* Time Section - Start Time and End Time */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Time
              </label>

              <div className="grid grid-cols-2 gap-3" ref={timeRef}>
                {/* Start Time */}
                <div className="relative">
                  <button
                    onClick={() => setIsTimeOpen(!isTimeOpen)}
                    className="w-full rounded-lg bg-white border-1 border-gray-200 hover:border-gray-300 focus:border-[#2A2A72] px-3 py-2.5 text-xs sm:text-sm text-gray-700 transition-all duration-200 outline-none shadow-sm hover:shadow-md flex items-center justify-between"
                  >
                    <span className="font-medium">{startTime}</span>
                    {isTimeOpen ? (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>

                  {isTimeOpen && (
                    <div className="absolute top-full mt-2 w-full max-h-40 overflow-y-auto bg-white border-1 border-gray-200 rounded-lg shadow-lg z-20">
                      {availableTimeSlots.map((slot) => {
                        const [s, e] = slot.split(" - ");
                        return (
                          <button
                            key={slot}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setIsTimeOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                          >
                            <span className="font-medium">{s}</span>
                            <span className="text-gray-500 mx-2">to</span>
                            <span className="text-gray-500">{e}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* End Time */}
                <div>
                  <div className="w-full rounded-lg bg-gray-50 border-1 border-gray-200 px-3 py-2.5 text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">{endTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Repeat Dropdown */}
            <div className="relative" ref={repeatRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Repeat
              </label>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full rounded-lg bg-white border-1 border-gray-200 hover:border-gray-300 focus:border-[#2A2A72] text-gray-700 transition-all duration-200 py-3 px-4 text-sm outline-none shadow-sm hover:shadow-md flex items-center justify-between"
              >
                <span className="font-medium">
                  {getRepeatLabel(repeat, startDate)}
                </span>
                {isOpen ? (
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {isOpen && (
                <div className="absolute w-full mt-2 rounded-lg shadow-lg bg-white border-2 border-gray-200 focus:outline-none z-20">
                  <div className="py-1">
                    {["Does not repeat", "Daily", "Weekly", "Monthly"].map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setRepeat(option);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {getRepeatLabel(option, startDate)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#178a43] hover:bg-[#000080] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-8 py-3 rounded-lg transition-all duration-200 w-full  flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>Create Meeting</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="w-full bg-white rounded-xl flex -mt-2.5  flex-col lg:flex-row">
        <div className="w-full lg:w-2/3 mb-4 lg:mb-0">
          <div className="bg-white shadow-xl p-4 md:p-6 lg:p-6  rounded-2xl">
            {/* Calendar Header */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <div className="flex gap-2 items-center">
                <button onClick={goToday} className="px-3 py-1 md:px-4 md:py-2 md:text-sm text-xs cursor-pointer bg-gray-200 rounded-[4px] hover:text-white hover:bg-[#178a43]">Today</button>
                <button onClick={goPrev} className="text-[#3C3C3C] cursor-pointer"><ChevronLeft size={20} /></button>
                <button onClick={goNext} className="text-[#3C3C3C] cursor-pointer"><ChevronRight size={20} /></button>
                <span className="font-medium md:text-sm text-xs text-[#3C3C3C]">{daysArr[0].format("D MMM ")} – {daysArr[daysArr.length - 1].format("D MMM , YYYY")}</span>
              </div>

              {/* View Switch */}
              <div className="flex text-sm md:pr-4">
                <button onClick={() => setView("day")} className={`px-3 text-xs md:text-sm md:px-6 py-1.5  md:py-2 rounded-l-[30px] ${view === "day" ? "bg-[#178a43] text-white" : "bg-gray-100 text-[#3C3C3C]"}`}>Day</button>
                <button onClick={() => setView("3days")} className={`px-3 text-xs md:text-sm  md:px-4 py-1.5 md:py-2 ${view === "3days" ? "bg-[#178a43] text-white" : "bg-gray-100 text-[#3C3C3C]"}`}>3 Days</button>
                <button onClick={() => setView("week")} className={`px-3 text-xs md:text-sm  md:px-6 py-1.5 rounded-r-[30px] md:py-2 ${view === "week" ? "bg-[#178a43] text-white" : "bg-gray-100 text-[#3C3C3C]"}`}>Week</button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div
              className="grid -ml-[16px] w-full h-[60vh] sm:h-[70vh] md:h-[600px] overflow-auto"
              style={{
                gridTemplateColumns: `60px repeat(${daysArr.length}, 1fr)`,
              }}
              onMouseUp={handleMouseUp}
            >
              <div></div>
              {daysArr.map((day, idx) => (
                <div
                  key={idx}
                  className="flex border-r-[#e3e3e3] border-b-[#cacaca] text-gray-500 flex-col items-center justify-center mb-2 font-medium text-[12px] sm:text-xs min-w-[90px] bg-white sticky top-0 z-10"
                >
                  {day.format("ddd")}
                  <span className="text-[20px] sm:text-[20px] text-gray-700 ">
                    {day.format("D")}
                  </span>
                </div>
              ))}

              {availableTimeSlots.map((slot, i) => {
                const [slotStart] = slot.split(" - ");
                const { hours } = parseTime(slotStart);

                return (
                  <React.Fragment key={i}>
                    <div className="sticky left-0 z-10 md:mr-1 bg-white h-10 text-[10px] sm:text-xs text-gray-500 flex items-start justify-end pr-2 sm:pr-4 border-gray-300">
                      {formatHour(slotStart)}
                    </div>
                    {daysArr.map((day, j) => {
                      const isDragging =
                        dragging &&
                        dragging.day.isSame(day, "day") &&
                        i >= Math.min(dragging.startHour, dragging.endHour) &&
                        i <= Math.max(dragging.startHour, dragging.endHour);
                      const isSelectedTime =
                        day.isSame(dayjs(startDate), "day") &&
                        hours === selectedHour;
                      const meeting = getMeetingForSlot(day, slot);

                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`relative border-b border-r border-r-gray-300 border-b-gray-400 h-10 cursor-pointer min-w-[100px] sm:min-w-[110px] 
                               ${
                                 isDragging
                                   ? "bg-blue-200"
                                   : isSelectedTime
                                   ? "bg-gray-300 animate-pulse rounded-[6px]"
                                   : meeting
                                   ? "bg-green-100 border-green-300"
                                   : "hover:bg-blue-50"
                               } 
                               group`}
                          onMouseDown={() => handleMouseDown(day, i)}
                          onMouseEnter={() => handleMouseEnter(day, i)}
                          onClick={() => {
                            setStartDate(day.toDate());
                            setSelectedSlot(slot);
                             const contentDiv = document.querySelector('.overflow-y-auto');
                             if (contentDiv) {
                            contentDiv.scrollTo({
                             top: 0,
                             behavior: 'smooth',
                              });
                              }
                            }} >
                          {meeting && (
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="bg-[#178a43] hover:bg-[#000080] flex flex-col text-white w-full h-full  p-1 truncate">
                                <span className="truncate text-[11px]">
                                  {meeting.meetingType.length > 16
                                    ? meeting.meetingType.substring(0, 15) +
                                      "..."
                                    : meeting.meetingType}
                                </span>
                                <span className="truncate text-[11px]">
                                  {meeting.meetingTime.length > 17
                                    ? meeting.meetingTime.substring(0, 18)
                                    : meeting.meetingTime}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Hover Card */}
                          {meeting && (
                            <div
                              className={`absolute ${
                                i >= 13
                                  ? "bottom-full "
                                  : "top-full "
                              } w-48 bg-gray-100 shadow-lg rounded-lg p-3 z-50 
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                                 pointer-events-none group-hover:pointer-events-auto 
                                ${j === daysArr.length - 1 ? "right-0" : "left-0"}`}
                              >
                              <h4 className="text-sm font-semibold text-gray-800">
                                {meeting.meetingType}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {meeting.meetingTime}
                              </p>

                              <div className="flex gap-2">
                                <Link
                                  to={`/room/${meeting.linkId}`}
                                   className="flex-1 bg-gradient-to-r  bg-[#178a43]  hover:bg-[#000080]  text-white flex justify-center items-center py-2 rounded-lg text-[12px] transition-all duration-200 hover:shadow-md transform hover:scale-105 active:scale-95"
                                >
                                  Join Meeting
                                </Link>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      if (navigator.share) {
                                        navigator
                                          .share({
                                            title: "Join My Meeting",
                                            text: `Join this meeting: ${
                                              meeting.meetingType
                                            } on ${new Date(
                                              meeting.meetingDate
                                            ).toLocaleDateString()}`,
                                            url: `${window.location.origin}/room/${meeting.linkId}`,
                                          })
                                          .catch((err) =>
                                            console.log("Share cancelled", err)
                                          );
                                      } else {
                                        alert(
                                          "Sharing is not supported on this browser."
                                        );
                                      }
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg text-xs transition-all duration-200 hover:shadow-sm transform hover:scale-105 active:scale-95"
                                    title="Share meeting"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                     onClick={() => {
                                       setSelectedRoom(meeting);
                                       setShowModal(true);
                                        }}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2 rounded-lg text-xs transition-all duration-200 hover:shadow-sm transform hover:scale-105 active:scale-95"
                                    title="Delete meeting"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full mt-9 lg:w-1/3  pl-2 pr-2 space-y-4">
          <Upcomming />
        </div>
      </div>
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
                disabled={isLoading}
                className="bg-[#178a43] hover:bg-[#2A2A72] text-sm text-white px-4 py-1 rounded"
              >
                {isLoading ? "Wait.." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMeeting;
