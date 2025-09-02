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

  // Method 1: Text-based Multi-page PDF (Recommended)
  const generateTextBasedPDF = async (meeting) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // === LOGO ===
    const logoWidth = 60;
    const logoHeight = 16;
    const logoX = (pageWidth - logoWidth) / 2;
    try {
      pdf.addImage(z, "PNG", logoX, yPosition, logoWidth, logoHeight);
    } catch (err) {
      console.warn("Logo not found, skipping image");
    }
    yPosition += logoHeight + 10;

    // === HEADER ===
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(34, 34, 34);
    pdf.text("Attendance Confirmation ", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 8;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(34, 34, 34);
    pdf.text("Live Online Video Meetings ", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 2;

    // Divider Line
    pdf.setDrawColor(253, 119, 44);
    pdf.setLineWidth(1);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // === INTRO TEXT ===
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(70, 70, 70);
    const introText = `Thank you for attending a Live Online Video Meeting on community.samzara.in. While you were there, you asked us toprovide confirmation of your attendance.Below are the details of the meeting you attended on ${dayjs(meeting.meetingDate).format("DD MMMM , YYYY hh:mm A")}which lasted for 60 minutes (${meeting.meetingType}).`;
    const splitIntroText = pdf.splitTextToSize(
      introText,
      pageWidth - 2 * margin
    );
    pdf.text(splitIntroText, margin, yPosition);
    yPosition += splitIntroText.length * 5 + 8;

    // === MEETING DETAILS BOX ===
    pdf.setFillColor(253, 236, 200);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 3, 3, "F");
    pdf.setTextColor(253, 119, 44);
    pdf.setFont("helvetica", "bold");
    pdf.text("Meeting Information", margin + 4, yPosition + 6);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    pdf.text(
      `Date: ${dayjs(meeting.meetingDate).format("DD MMMM, YYYY hh:mm A")}`,
      margin + 4,
      yPosition + 14
    );
    pdf.text(`Type: ${meeting.meetingType}`, margin + 90, yPosition + 14);
    yPosition += 26;

    // === PARTICIPANT DETAILS BOX ===
    pdf.setFillColor(220, 242, 241);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 18, 3, 3, "F");
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(31, 112, 184);
    pdf.text("Participant Information", margin + 4, yPosition + 6);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    pdf.text(`Name: ${user?.name || "Guest"}`, margin + 4, yPosition + 14);
    pdf.text(`Email: ${user?.email || "N/A"}`, margin + 80, yPosition + 14);
    yPosition += 26;

    // === ATTENDANCE EVENTS ===
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(44, 62, 80);
    pdf.text("Attendance Events", margin, yPosition);
    yPosition += 8;

    meeting.events.forEach((event, idx) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(253, 119, 44);
      pdf.text(`Event ${idx + 1}`, margin, yPosition);
      yPosition += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text(
        `JOIN: ${dayjs(event.joinTime).format("DD MMMM, YYYY hh:mm A")}`,
        margin + 5,
        yPosition
      );
      yPosition += 5;

      if (event.leaveTime) {
        pdf.text(
          `LEAVE: ${dayjs(event.leaveTime).format("DD MMMM, YYYY hh:mm A")}`,
          margin + 5,
          yPosition
        );
        yPosition += 5;
      }

      pdf.setTextColor(31, 112, 184);
      pdf.text("Digital Signature:", margin + 5, yPosition);

      // Calculate position for signature text right after the label
      const sigXPosition =
        margin + 5 + pdf.getTextWidth("Digital Signature: ") + 5;

      // Set color for signature text
      pdf.setTextColor(80, 80, 80);
      pdf.text(event.id, sigXPosition, yPosition);

      // Move yPosition for next line
      yPosition += 8;

      if (idx < meeting.events.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.5);
        pdf.line(margin + 3, yPosition, pageWidth - margin - 3, yPosition);
        yPosition += 5;
      }
    });

    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(31, 112, 184);
    const footer1 =
      "The community.samzara.in Digital Signature is a unique process that digitally signs and verifies your attendance.";
    pdf.text(
      pdf.splitTextToSize(footer1, pageWidth - 2 * margin),
      margin,
      yPosition
    );
    yPosition += 8;

    pdf.setTextColor(44, 62, 80);
    const footer2 =
      " If you are experiencing any problems with the meeting attendance verification system, please email support@samzara.in and we will assist you immediately.";
    pdf.text(
      pdf.splitTextToSize(footer2, pageWidth - 2 * margin),
      margin,
      yPosition
    );
    yPosition += 8;

    pdf.setFont("helvetica", "bold");
    pdf.text("Thank You,", margin, yPosition);
    yPosition += 5;
    pdf.text("The community.samzara.in Team", margin, yPosition);

    return pdf;
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
        let pdf;
        pdf = await generateTextBasedPDF(meeting);
        pdf.save(
          `attendance-${dayjs(meeting.meetingDate).format("YYYY-MM-DD")}.pdf`
        );
        setTimeout(() => setSelectedMeeting(null), 1000);
      } catch (error) {
        console.error("Error generating PDF:", error);

        // Fallback to original method
        try {
          const canvas = await html2canvas(element, {
            scale: 1,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 800,
            windowHeight: element.scrollHeight,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const canvasHeight = canvas.height;
          const canvasWidth = canvas.width;
          const ratio = pdfWidth / canvasWidth;
          const scaledHeight = canvasHeight * ratio;

          if (scaledHeight <= pdfHeight) {
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
          } else {
            let position = 0;
            const pageCanvasHeight = pdfHeight / ratio;

            while (position < canvasHeight) {
              const pageCanvas = document.createElement("canvas");
              pageCanvas.width = canvasWidth;
              pageCanvas.height = Math.min(
                pageCanvasHeight,
                canvasHeight - position
              );

              const ctx = pageCanvas.getContext("2d");
              ctx.drawImage(
                canvas,
                0,
                position,
                canvasWidth,
                pageCanvas.height,
                0,
                0,
                canvasWidth,
                pageCanvas.height
              );

              if (position > 0) {
                pdf.addPage();
              }

              pdf.addImage(
                pageCanvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                pdfWidth,
                pageCanvas.height * ratio
              );
              position += pageCanvas.height;
            }
          }

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

      {/* Modal */}
      {selectedMeeting && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            id="attendance-modal-content"
            className="w-full max-w-lg p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh]"
            style={{ backgroundColor: "#ffffff", color: "#374151" }}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 cursor-pointer hover:opacity-75 print:hidden"
              style={{ color: "#6B7280" }}
              onClick={() => setSelectedMeeting(null)}
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <img src={z} className="w-35" alt="Logo" />
              <h2 className="text-lg md:text-xl" style={{ color: "#000000" }}>
                Attendance Details
              </h2>
            </div>
            <div
              className="mt-3"
              style={{ borderTop: "1px solid #D1D5DB" }}
            ></div>

            {/* Intro */}
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

            {/* User Info */}
            <div
              className="py-2 text-xs sm:text-sm md:text-base"
              style={{ color: "#374151" }}
            >
              <div className="flex gap-2">
                <p>Member Name:</p>
                <b>{user?.name || "Guest"}</b>
              </div>
              <div className="flex gap-2">
                <p>Email:</p>
                <b>{user?.email || "N/A"}</b>
              </div>
            </div>

            {/* Events */}
            <div className="py-2" style={{ color: "#374151" }}>
              <div className="mt-2 space-y-4">
                {selectedMeeting.events.map((e, i) => (
                  <div key={i} className="pb-3">
                    <p className="text-sm" style={{ color: "#4B5563" }}>
                      Connection Type:{" "}
                      <span className="font-bold" style={{ color: "#374151" }}>
                        JOIN
                      </span>{" "}
                      at{" "}
                      <span style={{ color: "#1F2937" }}>
                        {dayjs(e.joinTime).format("MMMM DD, YYYY, hh:mm A")}
                      </span>
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#4B5563" }}>
                      Digital Signature:{" "}
                      <span className="break-all" style={{ color: "#2563EB" }}>
                        {e.id}
                      </span>
                    </p>
                    <div
                      className="mt-3"
                      style={{ borderBottom: "2px dotted #9CA3AF" }}
                    ></div>

                    {/* LEAVE Block */}
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

            {/* Footer */}
            <div>
              <p className="text-sm" style={{ color: "#374151" }}>
                The community.samzara.in Digital Signature is a unique process
                that digitally signs and verifies your attendance upon request.
              </p>
              <p className="text-sm mt-2" style={{ color: "#374151" }}>
                If you are experiencing any problems with the meeting attendance
                verification system, please email <b>support@samzara.in</b> and
                we will get back with you immediately.
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
