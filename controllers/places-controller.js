const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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

const getPlaceByID = (req, res, next) => {
  const placeId = req.params.placeId;

  const place = DUMMY_PLACES.find((place) => place.id === placeId);

  if (!place) {
    return next(new HttpError('Could not find a place with provided ID.', 404));

    // for asynchronous functions: return next(error);
    // for synchronous functions, use either return next(error) or alternatively: throw error;
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.userId;
  const places = DUMMY_PLACES.filter((place) => place.creator === userId);

  if (!places || places.length === 0) {
    return next(
      new HttpError(
        'Could not find any places matching the provided user ID.',
        404
      )
    );
  }

  res.json({ places });
};

exports.getPlaceByID = getPlaceByID;
exports.getPlacesByUserId = getPlacesByUserId;
