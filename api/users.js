/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserByUsername, createUser } = require('../db/users.js')
const { requireUser } = require('./utils.js')
const { UnauthorizedError } = require("../errors.js");
const { getPublicRoutinesByUser, getAllRoutinesByUser } = require('../db/routines.js')

// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    //check for existing user first
    try {
        const userExists = await getUserByUsername(username)
        if (userExists) {
            next({
                error: "Error registering",
                name: "UserExists",
                message: `User ${username} is already taken.`
            });
        }
        if (password.length < 8) {
            next({
                error: "Error registering",
                message: "Password Too Short!",
                name: "InvalidPassword"
            })
        } else {
        const newUser = await createUser(req.body);
        const token = jwt.sign(
          {
            id: newUser.id,
            username,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1w",
          }
        );
        
        res.send({
            message: "Registration successful!",
            token: token,
            user: {
                id: newUser.id,
                username: username
            }
        })
        }   
    } catch ({error, name, message}) {
        next({error, name, message})
    }
})

// POST /api/users/login
router.post('/login', async (req, res, next) => {
    const { username, password} = req.body;
    if (!username || !password) {
        next({
            error: "Login Error",
            name: "MissingCredentials",
            message: "Please provide both a username and password"
        })
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password === password) {
            const token = jwt.sign(
              { id: user.id, username: user.username },
              process.env.JWT_SECRET
            );
            res.send({
                user: {
                    id: user.id,
                    username: user.username
                },
                message: "you're logged in!",
                token: token
            })
        } else {
            next({
                error: "Login Error",
                name: "IncorrectCredentials",
                message: "Username or password is incorrect"
            })
        }
    } catch ({ error, name, message }) {
      next({ error, name, message });
    }
})

// GET /api/users/me
router.get('/me', requireUser, async (req, res, next) => {
    if (!req.headers) {
        res.status(401).send(UnauthorizedError())
    }
    try {
        const user = await getUserByUsername(req.user.username)
        res.send({
            id: user.id,
            username: user.username
        })
    } catch ({error, name, message}) {
        next({ error, name, message })
    }
})

// GET /api/users/:username/routines
router.get('/:username/routines', async (req, res, next) => {
    console.log("PARAMS:", req.params);
    console.log("USER:", req.user)
    try {
        if (req.user.username === req.params.username) {
            const userRoutines = await getAllRoutinesByUser(req.user);
            res.status(200).send(userRoutines);
        } else {
        const userRoutines = await getPublicRoutinesByUser(req.params);
        res.status(200).send(userRoutines);
        }
    } catch ({error, name, message}) {
        next({ error, name, message });
    }
})

module.exports = router;