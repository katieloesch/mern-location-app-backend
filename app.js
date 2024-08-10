const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

//middleware
app.use(bodyParser.json());
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

//error handling
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});
app.use((error, req, res, next) => {
  //error handling -> 4 parameters
  // will run if any middleware throws an error
  if (res.headerSent) {
    return next(error);
  }
  // if no response has been sent
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unknown error occured!' });
});

app.listen(5100, () => {
  console.log('server running on port 5100...');
});
