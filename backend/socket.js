// socket.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel')

const secretKey = crypto.createHash('sha256').update(String('your-secret-key')).digest('base64').substr(0, 32);


const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token, "client")
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
      socket.user = user;
      next();
    });
  });

  io.on("connection", async(socket) => {
    console.log("New client connected", socket.user);
    socket.on('userFindemail', async(data) => {
      console.log("Message received:", data);
      try {
        
  
        // Find users based on the email
        const user_data = await User.find({ email: data }).limit(4);
        console.log(user_data, "user_data")
  
        // If no user data is found, emit "none"
        if (user_data.length === 0) {
          io.emit("res_userFindemail", null);
        } else {
          // Emit the user data
          io.emit("res_userFindemail", user_data);
        }
      } catch (error) {
        // Handle any potential errors (e.g., database errors)
        console.error("Error finding user:", error);
        io.emit("res_userFindemail", null);
      }
    })


    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

};

module.exports = socketHandler;