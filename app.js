const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

//error handling -> 4 parameters
// will run if any middleware throws an error
app.use((error, req, res, next) => {
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
