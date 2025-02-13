// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors')

const app = express();

// Enable CORS



dotenv.config();

// srver
const userRouter = require('./router/userRouter');
const User = require('./models/userModel');
// Initialize Express app

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  })
  .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use(userRouter)
