import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import z from "../components/LOGO.png";
import PDFlogo from "../components/LOGO.png";
import jsPDF from "jspdf";
import image from "../components/image-c.jpg";

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

  // PDF Generator
  const generateTextBasedPDF = async (meeting) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const linePadding = 0;

    // Header image and logo
    const bgWidth = pageWidth;
    const bgHeight = 4;
    const imgProps = pdf.getImageProperties(image);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    const scale = Math.max(bgWidth / imgWidth, bgHeight / imgHeight);
    const newWidth = imgWidth * scale;
    const newHeight = imgHeight * scale;
    const x = (bgWidth - newWidth) / 2;
    const y = (bgHeight - newHeight) / 2;
    pdf.addImage(image, "JPEG", x, y, newWidth, newHeight);

    const logoWidth = 70;
    const logoHeight = 15;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 10;
    pdf.addImage(PDFlogo, "PNG", logoX, logoY, logoWidth, logoHeight);

    // Title bar
    const whiteBarY = 35;
    const whiteBarHeight = 12;
    const barWidth = pageWidth - 100;
    const barX = (pageWidth - barWidth) / 2;
    const radius = 2;

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(255, 255, 255);
    pdf.roundedRect(
      barX,
      whiteBarY,
      barWidth,
      whiteBarHeight,
      radius,
      radius,
      "F"
    );
    pdf.saveGraphicsState();
    pdf.roundedRect(
      barX,
      whiteBarY,
      barWidth,
      whiteBarHeight + radius,
      radius,
      radius,
      "F"
    );
    pdf.rect(barX, whiteBarY + radius, barWidth, whiteBarHeight - radius, "F");
    pdf.restoreGraphicsState();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(198, 139, 62);
    pdf.text("Attendance Confirmation", pageWidth / 2, whiteBarY + 8, {
      align: "center",
    });

    // Orange bar
    const orangeBarY = whiteBarY + whiteBarHeight;
    const orangeBarHeight = 12;
    pdf.setFillColor(248, 153, 57);
    pdf.rect(barX, orangeBarY, barWidth, orangeBarHeight, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Live Online Video Meetings", pageWidth / 2, orangeBarY + 8, {
      align: "center",
    });

    const orangeLineY = orangeBarY + orangeBarHeight;
    const orangeLineHeight = 2;
    pdf.setFillColor(248, 153, 57);
    pdf.rect(0, orangeLineY, pageWidth, orangeLineHeight, "F");

    // Intro
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(70, 70, 70);
    const introY = 74;
    const introText = `Thank you for attending a Live Online Video Meeting on community.samzara.in. While you were there, you asked us to provide confirmation of your attendance. Below are the details of the meeting you attended on ${dayjs(
      meeting.meetingDate
    ).format("DD MMMM, YYYY hh:mm A")} which lasted for 60 minutes (${
      meeting.meetingType
    }).`;
    const introLines = pdf.splitTextToSize(introText, pageWidth - 40);
    pdf.text(introLines, 20, introY);

    // Meeting & Participant Info
    const infoY = introY + introLines.length * 5 + 8;
    const boxWidth = (pageWidth - 60) / 2;
    const boxHeight = 32;
    const boxY = infoY;
    const box1X = 20;
    const box2X = 20 + boxWidth + 20;

    // Meeting Information (Green)
    pdf.setFillColor(23, 138, 67);
    pdf.roundedRect(box1X, boxY, boxWidth, boxHeight, 5, 5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Meeting Information", box1X + 7, boxY + 9);
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.7);
    pdf.line(
      box1X + linePadding,
      boxY + 12,
      box1X + boxWidth - linePadding,
      boxY + 12
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text(
      `Date: ${dayjs(meeting.meetingDate).format("DD MMMM, YYYY hh:mm A")}`,
      box1X + 7,
      boxY + 20
    );
    pdf.text(`Type: ${meeting.meetingType}`, box1X + 7, boxY + 27);

    // Participant Information (Blue)
    pdf.setFillColor(39, 41, 116);
    pdf.roundedRect(box2X, boxY, boxWidth, boxHeight, 5, 5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Participant Information", box2X + 7, boxY + 9);
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.7);
    pdf.line(
      box2X + linePadding,
      boxY + 12,
      box2X + boxWidth - linePadding,
      boxY + 12
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Name: ${user?.name || "Guest"}`, box2X + 7, boxY + 20);
    pdf.text(`Email: ${user?.email || "N/A"}`, box2X + 7, boxY + 27);

    // Attendance Events
    let eventsY = infoY + 45;
    const bottomMargin = 37 + 10;
    const topMargin = 20;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80);
    pdf.text("Attendance Events:", 20, eventsY);
    eventsY += 7;

    meeting.events.forEach((event, idx) => {
      // Estimate event height (adjust if needed)
      let eventHeight = 20;
      if (event.leaveTime) eventHeight += 5;

      if (eventsY + eventHeight > pageHeight - bottomMargin) {
        pdf.addPage();
        eventsY = topMargin;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(44, 62, 80);
        pdf.text("Attendance Events (continued):", 20, eventsY);
        eventsY += 7;
      }

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(253, 119, 44);
      pdf.text(`Event ${idx + 1}`, 20, eventsY);

      eventsY += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text(
        `JOIN: ${dayjs(event.joinTime).format("DD MMMM, YYYY hh:mm A")}`,
        25,
        eventsY
      );

      if (event.leaveTime) {
        eventsY += 5;
        pdf.text(
          `LEAVE: ${dayjs(event.leaveTime).format("DD MMMM, YYYY hh:mm A")}`,
          25,
          eventsY
        );
      }

      eventsY += 5;
      pdf.setTextColor(31, 112, 184);
      pdf.text("Digital Signature:", 25, eventsY);
      pdf.setTextColor(80, 80, 80);
      pdf.text(event.id, 60, eventsY);

      eventsY += 7;
    });

    // Footer Bar
    const footerY = pageHeight - 37;
    pdf.setFillColor(248, 153, 57);
    pdf.rect(0, footerY, pageWidth, 37, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const footerText1 =
      "The community.samzara.in Digital Signature is a unique process that digitally signs and verifies your attendance. If you are experiencing any problems with the meeting attendance verification system, please email support@samzara.in and we will assist you immediately.";
    pdf.text(pdf.splitTextToSize(footerText1, pageWidth - 20), 10, footerY + 7);
    pdf.setFont("helvetica", "bold");
    pdf.text("Thank You,", 10, footerY + 28);
    pdf.text("The community.samzara.in Team", 10, footerY + 33);

    return pdf;
  };

  // Download PDF handler
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
      }
    }, 500);
  };

  // Fetch meetings data
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          "http://localhost:5000/api/attendance/attendance/my",
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
    <div className="p-3 mt-2">
      {/* Header */}
      <div className=" justify-center items-center text-center bg-[#f89939]  p-4 rounded-lg text-white mb-4">
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
            className="w-full max-w-2xl p-0 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh] bg-white"
          >
            {/* Close Button */}
            <button
              className="absolute top-3 z-50 right-3 text-white cursor-pointer hover:opacity-75"
              onClick={() => setSelectedMeeting(null)}
            >
              ✕
            </button>

            {/* Header Bar */}
            <div
              className="relative rounded-[12px] overflow-hidden"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "250px",
              }}
            >
              {/* Soft overlay for background */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* Centered Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full py-10">
                {/* Logo */}
                <img src={z} alt="Logo" className="w-44 mb-4" />
                {/* Attendance Confirmation Bar */}
                <div className="bg-white/90 rounded-t-lg px-8 py-2 w-full max-w-md text-center shadow-md">
                  <h2 className="text-xl font-bold text-[#f89939] tracking-wide">
                    Attendance Confirmation
                  </h2>
                </div>
                {/* Meeting Info Bar */}
                <div className="bg-[#f89939] rounded-b-lg px-8 py-2 w-full max-w-md text-center flex items-center justify-center gap-2 shadow-md">
                  <span className="text-white text-base font-semibold">
                    Live Online Video Meetings
                  </span>
                </div>
              </div>
            </div>

            {/* Intro */}
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Thank you for attending a <b>Live Online Video Meeting</b> on{" "}
                <b>community.samzara.in</b>. Below are the details of the
                meeting you attended on{" "}
                <b>
                  {dayjs(selectedMeeting.meetingDate).format(
                    "MMMM DD, YYYY hh:mm A"
                  )}
                </b>{" "}
                which lasted for <b>60 minutes</b> (
                {selectedMeeting.meetingType}).
              </p>

              {/* Info Boxes */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Meeting Information */}
                <div className="flex-1 rounded-lg overflow-hidden border border-green-200">
                  <div className="bg-[#1a8b45] p-2 text-center">
                    <h3 className="font-bold text-white text-base m-0">
                      Meeting Information
                    </h3>
                  </div>
                  {/* White line divider */}
                  <div className="bg-white h-1 w-full"></div>
                  <div className="bg-[#1a8b45] p-3 text-white text-sm">
                    <div>
                      Date:{" "}
                      {dayjs(selectedMeeting.meetingDate).format(
                        "DD MMMM, YYYY hh:mm A"
                      )}
                    </div>
                    <div>Type: {selectedMeeting.meetingType}</div>
                  </div>
                </div>
                {/* Participant Information */}
                <div className="flex-1 rounded-lg overflow-hidden border border-blue-200">
                  <div className="bg-[#282a74] p-2 text-center">
                    <h3 className="font-bold text-white text-base m-0">
                      Participant Information
                    </h3>
                  </div>
                  <div className="bg-white h-1 w-full"></div>
                  <div className="bg-[#282a74] p-3 text-white text-sm">
                    <div>Name: {user?.name || "Guest"}</div>
                    <div>Email: {user?.email || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Attendance Events */}
              <h3 className="text-gray-800 font-bold mb-2">
                Attendance Events:
              </h3>
              {selectedMeeting.events.map((e, i) => (
                <div key={i} className="mb-4">
                  <p className="font-bold text-[#f89939]">Event {i + 1}</p>
                  <p className="text-sm text-gray-700">
                    JOIN: {dayjs(e.joinTime).format("MMMM DD, YYYY hh:mm A")}
                  </p>
                  {e.leaveTime && (
                    <p className="text-sm text-gray-700">
                      LEAVE:{" "}
                      {dayjs(e.leaveTime).format("MMMM DD, YYYY hh:mm A")}
                    </p>
                  )}
                  <p className="text-sm text-blue-600">
                    Digital Signature: <span className="break-all">{e.id}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-[#f89939] text-white p-4 rounded-b-xl text-sm">
              <p>
                The community.samzara.in Digital Signature is a unique process
                that digitally signs and verifies your attendance. If you are
                experiencing any problems, please email support@samzara.in.
              </p>
              <p className="mt-2 font-bold">Thank You,</p>
              <p className="font-bold">The community.samzara.in Team</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRequests;
