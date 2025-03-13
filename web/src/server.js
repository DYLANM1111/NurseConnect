require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const {sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');


//import route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const applicaitonRoutes = require('./routes/applicationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

//import socket handlders
const socketHandlers = require('./socket/handlers');

//initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


//middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(moran('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: flase }));


//initialize passport
require('./config/passport');
app.use(passport.initialize());

//api routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/applications', applicaitonRoutes);
app.use('/api/payments', paymentRoutes);

//checking health of server
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

//error handling middleware
app.use(errorHandler);

//socket.io connection
io.on('connection', socketHandlers.handleConnection);

//starting the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});


//export for testing
module.exports = {app,server};
