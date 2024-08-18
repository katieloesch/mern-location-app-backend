const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/places-controller');
const router = express.Router();

router.get('/:placeId', placesController.getPlaceByID);

router.get('/user/:userId', placesController.getPlacesByUserId);

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesController.createPlace
);

router.patch('/:placeId', placesController.updatePlace);

router.delete('/:placeId', placesController.deletePlace);

module.exports = router;
