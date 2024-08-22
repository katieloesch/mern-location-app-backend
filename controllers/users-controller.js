const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const DUMMY_USERS = [
  {
    id: 'u0',
    name: 'Sara',
    email: 'saralance@queenindustrie.com',
    password: 'notsoblackcanary',
  },
  {
    id: 'u1',
    name: 'John',
    email: 'johnconstantine@warlocks.com',
    password: 'unicorntears',
  },
];

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password, places } = req.body;

  let emailAlreadyExists;

  try {
    emailAlreadyExists = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Sign up failed, please try again later.', 500);
    return next(error);
  }

  if (emailAlreadyExists) {
    const error = new HttpError(
      'Email already registered, please login instead.',
      422
    );
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    image:
      'https://people.com/thmb/aSn4RsM25ETxV0e60F5waxfCVsY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(919x292:921x294)/Tom-Hiddleston-as-Loki-021423-9fb9630ef3474e42a996012c183419ad.jpg',
    password,
    places,
  });

  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError('Sign up failed, please try again later.', 500);
    return next(error);
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;

  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Log in failed, please try again later.', 500);
    return next(error);
  }

  if (!user || user.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  res.json({ msg: 'Logged in!' });
};

module.exports = {
  getUsers,
  signup,
  login,
};
