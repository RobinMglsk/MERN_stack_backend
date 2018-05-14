const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

const router = express.Router();

// Load user model
const User = require('../../models/User');

/**
 * @route   GET api/users/test
 * @desc    Test users route
 * @access  Public
 */
router.get('/test', (req, res) => res.json({msg: "Users works"}));

/**
 * @route   POST api/users/register
 * @desc    Register user
 * @access  Public
 */
router.post('/register', (req, res) =>{

    User.findOne({ email: req.body.email })
        .then(user => {
            if(user){
                return res.status(400).json({email: 'Email already exists'});
            }else{

                const avatar = gravatar.url(req.body.email,{
                    s:'200', // Size
                    r: 'pg', // Rating
                    d: 'mm'  // default
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.error(err));
                    })
                })
            }
        }).catch(err => {
            console.error(err);
            console.log(req.body)
            return res.status(500).json({});
        });

});

/**
 * @route   POST api/users/login
 * @desc    Login user / return JWT Token
 * @access  Public
 */
router.post('/login', (req, res) => {

    const email= req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({email: email})
    .then( user => {
        
        // Check for user
        if(!user){
            return res.status(404).json({email: 'User not found'});
        }

        // Check password
        bcrypt.compare(password, user.password)
            .then(isMatch => {
                if(isMatch){
                    // User matched

                    const payload = {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar
                    };

                    // Sign token
                    jwt.sign(payload, keys.secretKey, {expiresIn: 3600}, (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer '+token,
                        });
                    });
                }else{
                    return res.status(404).json({password: 'Password incorrect'});
                }
            }).catch(err => {
                console.error(err)
                return res.status(500).json({error:500});
            });

    });
});

/**
 * @route   POST api/users/current
 * @desc    retrun current user
 * @access  Private
 */
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;