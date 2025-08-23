const dayjs = require("dayjs");
const { RtcRole, RtcTokenBuilder } = require("agora-access-token");
const Agora = require("../Modal/Agoraa");


function generateLinkId() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segmentLengths = [4, 5, 4];
  return segmentLengths
    .map(len =>
      Array.from({ length: len }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('')
    ).join('-');
}


function getNthWeekdayOfMonth(baseDate, monthsToAdd = 1) {
  const date = new Date(baseDate);

  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const nth = Math.ceil(dayOfMonth / 7);

  const targetMonth = date.getMonth() + monthsToAdd;
  const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = targetMonth % 12;

  const firstDay = new Date(targetYear, normalizedMonth, 1);
  let offset = (dayOfWeek - firstDay.getDay() + 7) % 7;
  let targetDate = 1 + offset + (nth - 1) * 7;


  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  if (targetDate > lastDay) {
    targetDate -= 7; 
  }

  return new Date(targetYear, normalizedMonth, targetDate);
}

// ✅ Create recurring meetings in batch
async function createRecurringMeetings(user, meetingData, recurrence) {
  const { meetingType, meetingDate, meetingTime, meetingRepeat } = meetingData;
  const appId = process.env.APP_ID;
  const appCertificate = process.env.APP_CERTIFICATE;

  const startDate = dayjs(meetingDate);
  const meetingsToCreate = [];

  const loopCount = meetingRepeat === "Does not repeat" ? 1 : recurrence.batchSize;

for (let i = 0; i < loopCount; i++) {
  let dateToUse = startDate;

  if (meetingRepeat === "Daily") {
    dateToUse = startDate.add(i * recurrence.interval, "day");
  } else if (meetingRepeat === "Weekly") {
    dateToUse = startDate.add(i * recurrence.interval, "week");
  } else if (meetingRepeat === "Monthly") {
    dateToUse = dayjs(
      getNthWeekdayOfMonth(startDate.toDate(), i * recurrence.interval)
    );
  }
    const linkId = generateLinkId();
    const channelName = linkId;
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 86400;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    meetingsToCreate.push({
      token,
      linkId,
      appId,
      channel: channelName,
      user,
      meetingType,
      meetingDate: dateToUse.toDate(),
      meetingTime,
      meetingRepeat,
      recurrence
    });
  }

  return await Agora.insertMany(meetingsToCreate);
}


async function extendRecurringMeetings(userId, meetingType) {
  const lastMeeting = await Agora.findOne({
    "user._id": userId,
    meetingType
  }).sort({ meetingDate: -1 });

  if (!lastMeeting || !lastMeeting.recurrence) return;

  let nextDate;
  if (lastMeeting.meetingRepeat === "Monthly") {
    nextDate = getNthWeekdayOfMonth(
      lastMeeting.meetingDate,
      lastMeeting.recurrence.interval
    );
  } else {
    nextDate = dayjs(lastMeeting.meetingDate).add(
      lastMeeting.recurrence.interval,
      lastMeeting.recurrence.repeatType.toLowerCase()
    ).toDate();
  }

  return await createRecurringMeetings(
    lastMeeting.user,
    {
      meetingType: lastMeeting.meetingType,
      meetingDate: nextDate,
      meetingTime: lastMeeting.meetingTime,
      meetingRepeat: lastMeeting.meetingRepeat
    },
    lastMeeting.recurrence
  );
}

module.exports = { createRecurringMeetings, extendRecurringMeetings };
