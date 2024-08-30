require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL;

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

//middleware
app.use(bodyParser.json());
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  // handle cors issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

//error handling
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});
app.use((error, req, res, next) => {
  // error handling -> 4 parameters
  // will run if any middleware throws an error

  if (req.file) {
    // if there is an error, delete image
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(error);
  }
  // if no response has been sent
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    app.listen(5100, () => {
      console.log('server running on port 5100...');
    });
  })
  .catch((error) => {
    console.log(error);
  });
