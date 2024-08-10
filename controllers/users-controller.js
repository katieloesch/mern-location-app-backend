const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');

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

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const emailExists = DUMMY_USERS.find((user) => user.email === email);

  if (emailExists) {
    throw new HttpError('Could not create user, email already exists.', 422);
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(newUser);
  res.status(201).json({ user: newUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const user = DUMMY_USERS.find((user) => user.email === email);

  if (!user || user.password !== password) {
    throw new HttpError(
      'Could not identify user, credentials seem to be wrong.',
      401
    );
  }
  res.json({ msg: 'logged in!' });
};

module.exports = {
  getUsers,
  signup,
  login,
};
