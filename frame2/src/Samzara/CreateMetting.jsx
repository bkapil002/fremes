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
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      console.log("Meeting Created:", res.data);
      alert("Meeting Created Successfully ");
      setTitle("");
      setStartDate(new Date());
      setSelectedSlot(timeSlots[0]);
      setRepeat("Does not repeat");
      window.location.reload();
    } catch (error) {
      console.error("Error creating meeting:", error.response?.data || error);
      alert("Failed to create meeting ");
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

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 md:p-6 md:rounded-2xl">
      {/* Create Meeting Section */}
      <div className="bg-white w-full rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex w-full sm:flex-row gap-4 items-start sm:items-center">
          <button onClick={() => setTitle("")} className="text-gray-600 hover:text-gray-800 transition-colors"><X size={24} /></button>

          <div className="flex gap-3 sm:gap-3 items-start sm:items-center">
            <div className="relative w-full sm:w-72 lg:w-96">
              <input type="text" value={title} onChange={handleChange} className="border-b-2 border-gray-300 w-full text-gray-800 text-base sm:text-lg lg:text-xl outline-none focus:border-[#2A2A72] transition-colors pb-2" placeholder="Meeting title" />

              {filteredSuggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md z-50">
                  {filteredSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleSelect(suggestion)} className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-800 text-sm sm:text-base">{suggestion}</li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={handleSave} disabled={loading} className="bg-[#178a43] cursor-pointer hover:bg-[#000080] text-white text-sm sm:text-base px-5 sm:px-6 py-2 rounded-[8px] transition-colors sm:w-auto">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap gap-3 sm:gap-2 mt-6 items-start md:items-center">
          <div className="relative w-full md:w-34" ref={datePickerRef}>
            <button onClick={() => setShowDatePicker((s) => !s)} className="w-full rounded-lg bg-gray-100 border text-[#3C3C3C] border-gray-200 px-3 py-2 md:text-sm text-xs transition-all outline-none">
              {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </button>

            {showDatePicker && (
              <SimpleDatePicker selectedDate={startDate} onDateChange={setStartDate} minDate={new Date()} onClose={() => setShowDatePicker(false)} />
            )}
          </div>

          {/* Start Time */}
          <div className="relative flex w-full sm:w-70 justify-center items-center gap-2 " ref={timeRef}>
            <button onClick={() => setIsTimeOpen(!isTimeOpen)} className="flex items-center justify-between w-full md:w-36 rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              {startTime}
              {isTimeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isTimeOpen && (
              <div className="absolute mt-2 w-full max-h-40 overflow-y-auto bg-gray-100 border border-gray-200 rounded-lg shadow-lg z-20">
                {availableTimeSlots.map((slot) => {
                  const [s, e] = slot.split(" - ");
                  return (
                    <button key={slot} onClick={() => { setSelectedSlot(slot); setIsTimeOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <span className="pr-1">{s}</span> {" to "}<span className="text-gray-500 pl-1">{e}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <span className="hidden sm:block text-gray-500 text-sm">to</span>
            <div className="w-full sm:w-40 rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-xs md:w-36 sm:text-sm text-gray-700">{endTime}</div>
          </div>
        </div>

        {/* Repeat Dropdown */}
        <div className="mt-4 relative sm:w-60" ref={repeatRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center md:text-sm text-xs justify-between w-full md:min-w-[259px] rounded-lg bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors py-2 px-3  sm:text-sm">
            {getRepeatLabel(repeat, startDate)}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isOpen && (
            <div className="absolute w-full mt-1 rounded-lg shadow-lg bg-gray-100 border border-gray-200 focus:outline-none z-20">
              <div className="py-1">
                {["Does not repeat", "Daily", "Weekly", "Monthly"].map((option) => (
                  <button key={option} onClick={() => { setRepeat(option); setIsOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors md:text-sm text-xs text-gray-700">{getRepeatLabel(option, startDate)}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="w-full bg-white rounded-xl flex  flex-col lg:flex-row">
        <div className="w-full lg:w-2/3 mb-4 lg:mb-0">
          <div className="bg-white shadow-xl p-4 md:p-6 lg:p-6  rounded-2xl">
            {/* Calendar Header */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <div className="flex gap-2 items-center">
                <button onClick={goToday} className="px-3 py-1 md:px-4 md:py-2 md:text-sm text-xs cursor-pointer bg-gray-200 rounded-[4px] hover:text-white hover:bg-[#178a43]">Today</button>
                <button onClick={goPrev} className="text-[#3C3C3C] cursor-pointer"><ChevronLeft size={20} /></button>
                <button onClick={goNext} className="text-[#3C3C3C] cursor-pointer"><ChevronRight size={20} /></button>
                <span className="font-medium md:text-sm text-xs text-[#3C3C3C]">{daysArr[0].format("MMM D")} – {daysArr[daysArr.length - 1].format("MMM D, YYYY")}</span>
              </div>

              {/* View Switch */}
              <div className="flex text-sm md:pr-4">
                <button onClick={() => setView("day")} className={`px-3 text-xs md:text-sm md:px-6 py-1.5  md:py-2 rounded-l-[30px] ${view === "day" ? "bg-[#178a43] text-white" : "bg-gray-100 text-[#3C3C3C]"}`}>Day</button>
                <button onClick={() => setView("3days")} className={`px-3 text-xs md:text-sm  md:px-4 py-1.5 md:py-2 ${view === "3days" ? "bg-[#178a43] text-white" : "bg-gray-100 text-[#3C3C3C]"}`}>3 Days</button>
                <button onClick={() => setView("week")} className={`px-3 text-xs md:text-sm  md:px-6 py-1.5 rounded-r-[30px] md:py-2 ${view === "week" ? "bg-[#178a43] text-white" : "bg-gray-100 text-[#3C3C3C]"}`}>Week</button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid -ml-[16px] w-full h-[60vh] sm:h-[70vh] md:h-[600px] overflow-auto" style={{ gridTemplateColumns: `60px repeat(${daysArr.length}, 1fr)` }} onMouseUp={handleMouseUp}>
              <div></div>
              {daysArr.map((day, idx) => (
                <div key={idx} className="flex border-r-[#e3e3e3] border-b-[#cacaca] text-gray-500 flex-col items-center justify-center mb-2 font-medium text-[12px] sm:text-xs min-w-[90px] bg-white sticky top-0 z-10">
                  {day.format("ddd")}
                  <span className="text-[20px] sm:text-[20px] text-gray-700 ">{day.format("D")}</span>
                </div>
              ))}

              {availableTimeSlots.map((slot, i) => {
                const [slotStart] = slot.split(" - ");
                const { hours } = parseTime(slotStart);

                return (
                  <React.Fragment key={i}>
                    <div className="sticky left-0 z-10 md:mr-1 bg-white h-10 text-[10px] sm:text-xs text-gray-500 flex items-start justify-end pr-2 sm:pr-4 border-gray-300">{formatHour(slotStart)}</div>
                    {daysArr.map((day, j) => {
                      const isDragging = dragging && dragging.day.isSame(day, "day") && i >= Math.min(dragging.startHour, dragging.endHour) && i <= Math.max(dragging.startHour, dragging.endHour);
                      const isSelectedTime = day.isSame(dayjs(startDate), "day") && hours === selectedHour;
                      const meeting = getMeetingForSlot(day, slot);

                      return (
                        <div key={`${i}-${j}`} className={`relative border-b border-r   border-r-gray-300 border-b-gray-400 h-10 cursor-pointer min-w-[100px] sm:min-w-[110px] ${isDragging ? "bg-blue-200" : isSelectedTime ? "bg-gray-300 animate-pulse rounded-[6px]" : meeting ? "bg-green-100 border-green-300" : "hover:bg-blue-50"}`} onMouseDown={() => handleMouseDown(day, i)} onMouseEnter={() => handleMouseEnter(day, i)} onClick={() => { setStartDate(day.toDate()); setSelectedSlot(slot); }} title={meeting ? `Meeting: ${meeting.meetingType}` : ""}>
                          {meeting && (
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="bg-[#178a43] hover:bg-[#000080] hover: flex flex-col   text-white  w-full h-full rounded p-1 truncate">
                                <span className="truncate text-[11px] ">{meeting.meetingType.length > 16 ? meeting.meetingType.substring(0, 15) + "..." : meeting.meetingType}</span>
                                <span className="truncate text-[11px]">{meeting.meetingTime.length > 17 ? meeting.meetingTime.substring(0, 18) + "" : meeting.meetingTime}</span>
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
    </div>
  );
};

export default CreateMeeting;
