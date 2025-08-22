
const meetingSuggestions  = [
  "A 12-Step Meeting",
  "11th Step Meditation",
  "ACA [Adult Children]",
  "Agnostic AA",
  "Agnostic NA",
  "Alanon",
  "Alcoholics Anonymous",
  "CMA [Crystal Meth]",
  "CODA [Codependency]",
  "Gamblers Anonymous",
  "Narcotics Anonymous",
  "NA Pride [LGBT]",
  "Breathe/Chant/Meditate",
  "CMA",
  "CODA",
  "Codependency Grief and Relationships",
  "CPA",
  "Dual Diagnosis",
  "Healthy Love",
  "Life Recovery",
  "Miracles of Recovery",
  "NAMI Broward Connect to Mental Health",
  "Naranon",
  "NA Business",
  "NA Newcomers Workshop",
  "NA Pride",
  "Nurses Helping Nurses",
  "Recovery Dharma",
  "SAA",
  "She Recovers",
  "Spiritual Gangsters",
  "TAR",
  "Trauma & Recovery",
  "Wellbriety",
  "Women in Recovery",
  "Women Warriors",
  "Yoga Recovery",
];

const timeSlots = [
  "6:00 AM - 7:00 AM",
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM",
  "8:00 PM - 9:00 PM",
  "9:00 PM - 10:00 PM",
];

const uniqueMeetingTypes = [...new Set(meetingSuggestions )];

const meeting = {
  types: uniqueMeetingTypes,
  slots: timeSlots
};


export default meeting;


