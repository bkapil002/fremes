import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import z from "../components/LOGO.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AttendanceRequests = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const getCurrentTimeCustom = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDownloadPDF = async (meeting) => {
    setSelectedMeeting(meeting);

    setTimeout(async () => {
      const element = document.getElementById("attendance-modal-content");

      if (!element) {
        console.error("Modal content not found");
        return;
      }

      try {
        const clonedElement = element.cloneNode(true);
        clonedElement.style.position = "absolute";
        clonedElement.style.top = "-9999px";
        clonedElement.style.left = "-9999px";
        clonedElement.style.width = element.offsetWidth + "px";

        const replaceColors = (el) => {
          if (el.classList) {
            el.classList.forEach((cls) => {
              if (cls.includes("text-gray-")) {
                el.classList.remove(cls);
                el.classList.add("text-gray-700");
              }
              if (cls.includes("bg-gray-")) {
                el.classList.remove(cls);
                el.classList.add("bg-gray-100");
              }
              if (cls.includes("border-gray-")) {
                el.classList.remove(cls);
                el.classList.add("border-gray-300");
              }
            });
          }

          Array.from(el.children).forEach(replaceColors);
        };

        replaceColors(clonedElement);
        document.body.appendChild(clonedElement);

        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          ignoreElements: (element) => {
            return (
              element.classList &&
              (element.classList.contains("print:hidden") ||
                element.tagName === "BUTTON")
            );
          },
        });
        document.body.removeChild(clonedElement);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (pdfHeight > pdf.internal.pageSize.getHeight()) {
          const ratio = pdf.internal.pageSize.getHeight() / pdfHeight;
          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            pdfWidth * ratio,
            pdf.internal.pageSize.getHeight()
          );
        } else {
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save(
          `attendance-${dayjs(meeting.meetingDate).format("YYYY-MM-DD")}.pdf`
        );

        setTimeout(() => setSelectedMeeting(null), 1000);
      } catch (error) {
        console.error("Error generating PDF:", error);
        try {
          const canvas = await html2canvas(element, {
            scale: 1,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: false,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            pdfWidth,
            Math.min(pdfHeight, pdf.internal.pageSize.getHeight())
          );
          pdf.save(
            `attendance-${dayjs(meeting.meetingDate).format("YYYY-MM-DD")}.pdf`
          );

          setTimeout(() => setSelectedMeeting(null), 1000);
        } catch (fallbackError) {
          console.error("Fallback PDF generation also failed:", fallbackError);
          alert("Failed to generate PDF. Please try again or contact support.");
        }
      }
    }, 500);
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          "https://samzraa.onrender.com/api/attendance/attendance/my",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const data = response.data.records || response.data;
        const grouped = data.reduce((acc, rec) => {
          const id = rec.meetingId?._id?.toString() || rec.meetingId;
          if (!acc[id]) {
            acc[id] = {
              meetingId: id,
              meetingType: rec.meetingType,
              meetingDate: rec.meetingDate,
              meetingTime: rec.meetingTime,
              events: [],
            };
          }
          acc[id].events.push({
            id: rec._id || rec.id,
            joinTime: rec.joinTime,
            leaveTime: rec.leaveTime,
          });
          return acc;
        }, {});

        setMeetings(Object.values(grouped));
      } catch (error) {
        console.error("Error fetching attendance records:", error);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [user]);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="bg-gradient-to-r justify-center items-center text-center from-orange-500 to-orange-300 p-4 rounded-lg text-white mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          Recent Online Meeting Attendance Requests
        </h1>
        <div className="mt-2">
          <p className="text-sm sm:text-base">
            Your Local Time:{" "}
            <span className="font-semibold">{getCurrentTimeCustom()}</span>
          </p>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 px-4 md:px-6 text-xs sm:text-sm mb-4">
        <p className="text-center md:text-left flex-1">
          Click{" "}
          <span className="font-semibold">
            'Request Attendance Verification'
          </span>{" "}
          while enjoying our video meetings to receive these reports on your
          attendance.
        </p>
        <p className="text-red-600 text-center md:text-right font-semibold flex-1">
          For Meeting Attendance Verification Instructions click on{" "}
          <a href="#" className="text-blue-600 underline">
            FAQ's
          </a>
        </p>
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <div className="w-full border flex h-10 justify-center items-center bg-white border-gray-300 rounded-lg overflow-hidden text-sm">
          <p className="text-center text-gray-600">
            Loading attendance records...
          </p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="w-full border flex h-10 bg-white justify-center items-center border-gray-300 rounded-lg overflow-hidden text-sm">
          <p className="text-center text-gray-600">
            No attendance records found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border bg-white border-gray-300 rounded-lg overflow-hidden text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-left">
                <th className="p-2 sm:p-3 border-b">Meeting Date</th>
                <th className="p-2 sm:p-3 border-b">Meeting Type</th>
                <th className="p-2 sm:p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting, index) => (
                <tr
                  key={meeting.meetingId}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"}`}
                >
                  <td className="p-2 sm:p-3 whitespace-nowrap">
                    {dayjs(meeting.meetingDate).format("MMM DD, YYYY hh:mm A")}
                  </td>
                  <td className="p-2 sm:p-3">{meeting.meetingType}</td>
                  <td className="p-2 sm:p-3 text-blue-600 space-x-3 sm:space-x-4">
                    <button
                      onClick={() => setSelectedMeeting(meeting)}
                      className="hover:underline"
                    >
                      view
                    </button>
                    <button
                      className="cursor-pointer hover:underline"
                      onClick={() => handleDownloadPDF(meeting)}
                    >
                      pdf
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMeeting && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            id="attendance-modal-content"
            className="w-full max-w-lg p-6 rounded-xl shadow-lg relative"
            style={{ backgroundColor: "#ffffff", color: "#374151" }}
          >
            <button
              className="absolute top-3 right-3 cursor-pointer hover:opacity-75 print:hidden"
              style={{ color: "#6B7280" }}
              onClick={() => setSelectedMeeting(null)}
            >
              ✕
            </button>
            <div className="flex items-center gap-3">
              <img src={z} className="w-35" alt="Logo" />
              <h2 className=" text-lg md:text-xl" style={{ color: "#000000" }}>
                Attendance Details
              </h2>
            </div>
            <div
              className="mt-3"
              style={{ borderTop: "1px solid #D1D5DB" }}
            ></div>
            <p className="mb-3 mt-4 text-sm" style={{ color: "#374151" }}>
              Thank you for attending a <b>Live Online Video Meeting</b> on{" "}
              <b>community.samzara.in</b>. While you were there, you asked us to
              provide confirmation of your attendance. Below are the details of
              the meeting you attended on{" "}
              <b>
                {dayjs(selectedMeeting.meetingDate).format(
                  "MMMM DD, YYYY hh:mm A"
                )}
              </b>{" "}
              which lasted for <b>60 minutes</b> for{" "}
              <b>{selectedMeeting.meetingType}</b>
            </p>

            <div className="py-2" style={{ color: "#374151" }}>
              <div className="flex gap-2">
                <p>Member Name:</p>
                <b>{user?.name || "Guest"}</b>
              </div>
              <div className="flex gap-2">
                <p>Email:</p>
                <b>{user?.email || "N/A"}</b>
              </div>
            </div>

            <div className="py-2" style={{ color: "#374151" }}>
              <div className="mt-2 space-y-4">
                {selectedMeeting.events.map((e, i) => (
                  <div key={i} className="pb-3">
                    <div className="">
                      <p className="text-sm" style={{ color: "#4B5563" }}>
                        Connection Type:{" "}
                        <span
                          className="font-bold"
                          style={{ color: "#374151" }}
                        >
                          JOIN
                        </span>{" "}
                        at{" "}
                        <span style={{ color: "#1F2937" }}>
                          {dayjs(e.joinTime).format("MMMM DD, YYYY, hh:mm A")}
                        </span>
                      </p>
                      <p className="text-sm mt-1" style={{ color: "#4B5563" }}>
                        Digital Signature:{" "}
                        <span
                          className="break-all"
                          style={{ color: "#2563EB" }}
                        >
                          {e.id}
                        </span>
                      </p>
                      <div
                        className="mt-3"
                        style={{ borderBottom: "2px dotted #9CA3AF" }}
                      ></div>
                    </div>

                    {/* LEAVE Block (only if exists) */}
                    {e.leaveTime && (
                      <>
                        <p
                          className="text-sm mt-3"
                          style={{ color: "#4B5563" }}
                        >
                          Connection Type:{" "}
                          <span
                            className="font-bold"
                            style={{ color: "#374151" }}
                          >
                            LEAVE
                          </span>{" "}
                          at{" "}
                          <span style={{ color: "#1F2937" }}>
                            {dayjs(e.leaveTime).format(
                              "MMMM DD, YYYY, hh:mm A"
                            )}
                          </span>
                        </p>
                        <p
                          className="text-sm mt-1"
                          style={{ color: "#4B5563" }}
                        >
                          Digital Signature:{" "}
                          <span
                            className="break-all"
                            style={{ color: "#2563EB" }}
                          >
                            {e.id}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm" style={{ color: "#374151" }}>
                The community.samzara.in Digital Signature is a unique process
                that digitally signs and verifies your attendance upon request.
              </p>
              <p className="text-sm mt-2" style={{ color: "#374151" }}>
                If you are experiencing any problems with the meeting attendance
                verification system, please email support@samzara.in and we will
                get back with you immediately.
              </p>
              <p className="mt-2 text-sm" style={{ color: "#374151" }}>
                Thanks,
              </p>
              <p className="text-sm mt-1" style={{ color: "#374151" }}>
                <b>The community.samzara.in Team</b>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRequests;
