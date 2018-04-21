const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');

// stories index
router.get('/', (req,res) => {
  // populate will fetch user data as well (data which was reference by the model)
  Story.find({
    status: 'public'
  }).populate(
    'user'
  ).sort({
    date: 'desc'
  }).then((stories) => {
    res.render('stories/index', {
      stories: stories
    });
  });
});

// list stories from a user
router.get('/user/:userId', (req,res) => {
  Story.find({
    user: req.params.userId,
    status: 'public'
  }).populate(
    'user'
  ).then(stories => {
    res.render('stories/index', {
      stories: stories
    });
  });
});

// logged in users stories
router.get('/my', ensureAuthenticated, (req,res) => {
  Story.find({
    user: req.user.id
  }).populate(
    'user'
  ).then(stories => {
    res.render('stories/index', {
      stories: stories
    });
  });
});

// add story form
router.get('/add', ensureAuthenticated, (req,res) => {
  res.render('stories/add');
});

// add story form
router.get('/edit/:id', ensureAuthenticated, (req,res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      res.render('stories/edit', {
        story: story
      });
    }
  });
});

// show single Story
router.get('/show/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).populate(
    'user'
  ).populate(
    'comments.commentUser'
  ).then(story => {
    if (story.status == 'public') {
      res.render('stories/show', {
        story: story
      });
    } else {
      if (req.user) {
        if (story.user._id == req.user.id) {
          res.render('stories/show', {
            story: story
          });
        } else {
          res.redirect('/stories');          
        }
      } else {
        res.redirect('/stories');
      }
    }
  });
});

// process add Story
router.post('/', (req,res) => {
  let allowComments;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };

  // create Story
  new Story(newStory).save().then(story => {
    res.redirect(`/stories/show/${story.id}`);
  });
});

// ediform process
router.put('/:id', (req,res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    let allowComments;
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }
    // new values
    story.title = req.body.title;
    story.body = req.body.body;
    story.status = req.body.status;
    story.allowComments = allowComments;

    // save
    story.save().then(story => {
      res.redirect('/dashboard');
    });
  });
});

// delete Story
router.delete('/:id', (req,res) => {
  Story.remove({
    _id: req.params.id
  }).then(() => {
    res.redirect('/dashboard');
  });
});

// add commment
router.post('/comment/:id', (req,res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };

    // add to comments array
    // unshift adds to the beginning
    story.comments.unshift(newComment);
    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

module.exports = router;
