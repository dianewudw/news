const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const cookieParser = require('cookie-parser');
// const oauthController = require('./controllers/oauthController')
const userController = require('./controllers/userController');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const session = require('express-session')
const cors = require('cors');


app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res, next) => {
  if (req.cookies.isLoggedIn) {
    res.status(200).sendFile(path.resolve(__dirname, '../src/index.html'))
  }
  else {
    res.redirect('/login')
  }
})

app.use(express.static(path.resolve(__dirname, '../dist')));
//move secret to env later
app.use(session(({
  secret: 'abcx',
  resave: true,
  saveUninitialized: true
})));
app.use(passport.initialize());
app.use(passport.session());

// require('./config/passport')(passport);
passport.use(new LinkedInStrategy({
  clientID:'77mmt6otf0l7cw',
  clientSecret:'I6IAlHNXbgzJ1Hn1',
  callbackURL:'http://localhost:3000/main',
  scope: ['r_emailaddress', 'r_liteprofile'],
  state: true,
},
 function (accessToken, refreshToken, profile, done) {
   console.log('INSIDE ANONYMOUS FUNC')
  // asynchronous verification, for effect...
   process.nextTick(function () {
    // create obj of necessary user info
    // add user to db with middleware
    // move on
    // To keep the example simple, the user's LinkedIn profile is returned to
    // represent the logged-in user. In a typical application, you would want
    // to associate the LinkedIn account with a user record in your database,
    // and return that user instead.
    return done(null, profile);
  });
 }));

 passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  done(null, user);
});


app.get('/login', (req, res, next) => {
  res.status(200).sendFile(path.resolve(__dirname, '../src/login.html'))
})

app.post('/login', (req, res, next) => {
    res.cookie('isLoggedIn', true, {maxAge: 360000});
    next();
  },
  passport.authenticate('linkedin')
// ,(req, res) => {
//   console.log('WE SHOULDN\'T SEE THIS CONSOLE LOG IN GET /login');
// }
);

app.get('/main', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

app.post('/postUser', userController.checkIfUser, (req, res)=>{
  // user data on req body ready to send to front if needed
  res.sendStatus(200);
})

app.post('/postInterests', userController.postInterests,(req,res) =>{
  res
  .status(200)
  .send('posted favorites to the database')
})

app.get('/getInterests', userController.getInterests,(req,res) =>{
  console.log('RES LOCALS INTERESTS AFTER MIDDLEWARE -->', res.locals.interests)
  res
  .status(200)
})

app.listen(3000, () => { console.log('Listening on port 3000!'); });
