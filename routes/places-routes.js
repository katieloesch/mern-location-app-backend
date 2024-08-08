const express = require('express');
const placesController = require('../controllers/places-controller');
const router = express.Router();

router.get('/:placeId', placesController.getPlaceByID);

router.get('/user/:userId', placesController.getPlacesByUserId);

module.exports = router;
