const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

let DUMMY_PLACES = [
  {
    id: 'p0',
    title: 'Camden Head',
    description: 'best hunting ground for reindeer enthusiasts',
    imgUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRh0g9I_ZYibJtTuldCxDJBGB0r7-TiU2EeA&s',
    address: '100 Camden High St, London NW1 0LU',
    coordinates: {
      lat: 51.536388,
      lng: -0.140556,
    },
    creator: 'u0',
  },
  {
    id: 'p1',
    title: 'Camden Head',
    description: 'best hunting ground for reindeer enthusiasts',
    imgUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRh0g9I_ZYibJtTuldCxDJBGB0r7-TiU2EeA&s',
    address: '100 Camden High St, London NW1 0LU',
    coordinates: {
      lat: 51.536388,
      lng: -0.140556,
    },
    creator: 'u1',
  },
  {
    id: 'p2',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imgUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: 'u0',
  },
  {
    id: 'p3',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imgUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: 'u1',
  },
];

const getPlaceByID = async (req, res, next) => {
  const placeId = req.params.placeId;
  let place;
  try {
    place = await Place.findById(placeId); // does not return a real promise
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find a place with provided ID.',
      404
    );
    return next(error);

    // for asynchronous functions: return next(error);
    // for synchronous functions, use either return next(error) or alternatively: throw error;
  }

  res.json({ place: place.toObject({ getters: true }) }); // getters: true -> _if turn into id property
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.userId;
  let places;

  try {
    places = await Place.find({ creator: userId }); //does not return a real promise
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError(
        'Could not find any places matching the provided user ID.',
        404
      )
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      'https://entiretravel.imgix.net/getmedia/a196b23a-200d-4f59-ae72-c31af06f4a5d/about-tahiti.jpg?auto=format',
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided ID.', 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();

    sess.startTransaction();
    await newPlace.save({ session: sess });

    user.places.push(newPlace);
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: newPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.placeId;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place',
      500
    );
  }

  res.status(200).json({ updatedPlace: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.placeId;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete the place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this ID.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await place.deleteOne({ session: sess });

    place.creator.places.pull(place);
    await place.creator.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete the place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ msg: 'Deleted place.' });
};

module.exports = {
  getPlaceByID,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
