const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/posts');

/**
 * @route   GET api/post
 * @desc    Get posts
 * @access  Public
 */

router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json(err));
});

/**
 * @route   GET api/post/:id
 * @desc    Get post by id
 * @access  Public
 */

router.get('/:id', (req, res) => {
  const errors = {};

  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => {
      errors.post = `Post with id: ${req.params.id} not found`;
      res.status(404).json(errors);
      console.log(err);
    });
});

/**
 * @route   POST api/post
 * @desc    Create post
 * @access  Private
 */

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check valdiation
    if (!isValid) {
      // If any errors, send 400 with errors in object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => console.error(err));
  }
);

/**
 * @route   DELETE api/post/:id
 * @desc    Delete post
 * @access  Private
 */

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            // Check if user is owner of post
            if (post.user.toString() !== req.user.id) {
              res.status(401).json({ notAuthorized: `User not authorized` });
            }

            // Delete
            post
              .remove({})
              .then(() => {
                res.json({ success: true });
              })
              .catch(err =>
                res.status(404).json({ postNotFound: 'No post found' })
              );
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }
);

/**
 * @route   POST api/post/like/:id
 * @desc    Like post
 * @access  Private
 */

router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyLiked: `User already liked this post` });
            }

            // Add user id to likes array
            post.likes.unshift({ user: req.user.id });
            post
              .save()
              .then(post => res.json(post))
              .catch(err => console.log(err));
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }
);

/**
 * @route   POST api/post/unlike/:id
 * @desc    Unlike post
 * @access  Private
 */

router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ notLiked: `You have not liked this post` });
            }

            // Get the remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);

            // Spice it out of the array
            post.likes.splice(removeIndex, 1);
            post
              .save()
              .then(post => res.json(post))
              .catch(err => console.log(err));
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }
);

module.exports = router;
