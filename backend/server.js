import express from 'express'; // use for maing express server 
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

// Load environment variables
import dotenv from 'dotenv';

// socket congig
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import socketHandler from './socket.js';


//router  path
import userRouter from './router/userRouter.js';
import requestRouter from './router/requestRouter.js';
import chatRouter from './router/chatRouter.js';


// Load environment variables
dotenv.config();

// Initialize Express app and server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Adjust based on your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"]
  }
});
socketHandler(io);

// Connect to MongoDB
mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use(userRouter); // user related router login 
app.use(requestRouter); // fachiching data sending request etc ...
app.use(chatRouter);// chat related router........

// Start server
const PORT = process.env.PORT || 5000;  // taking cradintial from the chat env........ 
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
