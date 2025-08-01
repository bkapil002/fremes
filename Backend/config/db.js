
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  };

  const MAX_RETRIES = 3;
  let retries = 0;
  let connected = false;

  if (!process.env.MONGO) {
    console.error('MONGODB_URI environment variable is not set');
    return false;
  }

  while (!connected && retries < MAX_RETRIES) {
    try {
      await mongoose.connect(process.env.MONGO, options);
      console.log(`MongoDB Connected Successfully (Worker: ${process.pid})`);
      connected = true;
    } catch (error) {
      retries++;
      console.error(`Retry ${retries}/${MAX_RETRIES}: MongoDB connection error (Worker: ${process.pid})`, {
        message: error.message,
        name: error.name,
      });

      if (retries >= MAX_RETRIES) {
        console.error('Exceeded maximum retry attempts. Connection failed.');
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
  }

  return connected;
};

module.exports = connectDB;





