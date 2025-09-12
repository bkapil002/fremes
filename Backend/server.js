const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const setupCluster = require('./config/cluster');
const cookieParser = require('cookie-parser');
const user = require('./Routes/user')
const { router: agoraa, startTokenCron } = require("./Routes/agoraa");
const app = express();
const meetingAttendance = require('./Routes/meetingAttendance')
const removedUser = require('./Routes/removedUser')


app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['https://samzra.onrender.com','https://www.w3schools.com'],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));



app.use(cookieParser());
app.use(express.json());


process.on('SIGINT', async () => {
  console.log('Shutting down the server...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});


function validateEnvVars() {
  if (!process.env.MONGO) {
    throw new Error('MONGO is not defined in the environment');
  }
  if (!process.env.PORT) {
    throw new Error('PORT is not defined in the environment');
  }
}


async function initializeApp() {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      throw new Error('Failed to connect to MongoDB');
    }
   

    app.use('/api/users',user)
    // app.use('/api/agora',agora)
    app.use('/api/agora',agoraa)
    app.use('/api/attendance',meetingAttendance)
    app.use('/api/removeduser',removedUser)

    
    // Health check route
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Server is running',
        pid: process.pid,
      });
    });

    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} - Worker PID: ${process.pid}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      startTokenCron();
    });
  } catch (error) {
    console.error('Initialization error:', error.message);
    process.exit(1);
  }
}

validateEnvVars();
setupCluster(() => {
  initializeApp();
});

module.exports = app;