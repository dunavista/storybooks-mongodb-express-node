// next lecture:
// secion 10 lecture 63
// listing comments

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// load models
require('./models/User');
require('./models/Story');

// passport config
require('./config/passport')(passport);

// load routes
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');

// load keys
const keys = require('./config/keys');

// handlebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require('./helpers/hbs');

// mongoose connect
mongoose.connect(keys.mongoURI).then(() => {
  console.log('MongoDB Connected.');
}).catch((err) => {
  console.log(err);
});

// express app
const app = express();

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// method override middleware
app.use(methodOverride('_method'));

// handlebars middleware
app.engine('handlebars', exphbs({
  helpers: {
    truncate: truncate,
    stripTags: stripTags,
    formatDate: formatDate,
    select: select,
    editIcon: editIcon
  },
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// cookie parser
app.use(cookieParser());

// express session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// use routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

// setting port
// const port = process.env.PORT || 5000;
app.set( 'port', ( process.env.PORT || 5000 ));


app.listen(app.get( 'port' ), () => {
//  console.log(`Server started on port ${port}`);
  console.log('Server started on port ' + app.get( 'port' ));

});
