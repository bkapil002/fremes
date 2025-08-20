const cron = require("node-cron");
const Agora = require("../Modal/Agoraa");
const { extendRecurringMeetings } = require("./recurrence")

console.log("📅 Meeting Cron Job Initialized");
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Checking for recurring meetings to extend...");

  try {

    const usersWithRecurring = await Agora.aggregate([
      { $match: { "recurrence.repeatType": { $ne: "Does not repeat" } } },
      { $group: { _id: { user: "$user._id", type: "$meetingType" } } }
    ]);

    for (const entry of usersWithRecurring) {
      const upcomingMeetings = await Agora.find({
        "user._id": entry._id.user,
        meetingType: entry._id.type,
        meetingDate: { $gte: new Date() }
      }).sort({ meetingDate: 1 });

      if (upcomingMeetings.length <= 10) {
        console.log(` Extending meetings for user ${entry._id.user}, type ${entry._id.type}`);
        await extendRecurringMeetings(entry._id.user, entry._id.type);
      }
    }
  } catch (err) {
    console.error("Cron job failed:", err);
  }
});
