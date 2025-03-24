# DROPCHAT

## Overview
Project1 is a full-stack web application with a frontend built using React and Vite, and a backend powered by Express.js and MongoDB. The project integrates various libraries and tools for enhanced performance, security, and real-time communication.

## Features
### Frontend
- Developed using **React** with **Vite** for fast performance
- UI styled with **Tailwind CSS** and **Bootstrap**
- Uses **Axios** for API requests
- Animations powered by **Framer Motion**
- Routing implemented using **React Router DOM**
- Firebase authentication support
- Real-time communication with **Socket.io-client**

### Backend
- Built with **Node.js** and **Express.js**
- Secure authentication using **JWT (jsonwebtoken)**
- Database managed with **MongoDB and Mongoose**
- Environment variables handled with **dotenv**
- Supports **Redis** for caching
- Real-time communication enabled via **Socket.io**
- Uses **Twilio** for SMS notifications

## Tech Stack
### Frontend:
- React
- Vite
- Tailwind CSS
- Bootstrap
- Axios
- Firebase
- Framer Motion
- React Router DOM
- Socket.io-client

### Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- JWT Authentication
- Firebase
- Twilio
- Cors & Body-Parser

## Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (for backend)

### Setup
#### Frontend
```sh
cd frontend
npm install
npm run dev
```

#### Backend
```sh
cd backend
npm install
npm start
```

## Environment Variables
Create a `.env` file in the backend folder and add the following:
```sh
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
REDIS_URL=your_redis_url
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

## Usage
- Run the frontend using `npm run dev`
- Start the backend using `npm start`
- The frontend communicates with the backend via API requests

## License
This project is licensed under the MIT License.

---
### Contributors
- **Anubhav Pandit** (Developer)

Feel free to contribu
