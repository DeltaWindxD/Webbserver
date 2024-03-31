const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const path = require('path');
const fetch = require('node-fetch'); // Import the node-fetch module
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const multer = require('multer');
const Text = require('./models/Text');
const Image = require('./models/Image');


const app = express();
const port = 3003;
app.set('view engine', 'ejs');

// Admin route middleware
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.username === 'admin') {
    return next();
  }
  res.redirect('/admin/login');
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/') // Obs skapa en mapp i din struktur som heter uploads
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

app.post('/admin/addimage', upload.single('image'), async (req, res) => {
  try {
    const newImage = new Image({
      filename: req.file.filename,
      value: req.body.value // Save the position value from the form
    });
    await newImage.save();
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).send('Error saving image');
  }
});





mongoose.connect('mongodb+srv://morrismannen:Taratara2008@cluster0.gyprifu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to db'))
  .catch((err) => console.log(err));

// Create a model from the schema
const users = [
  { id: 1, username: 'admin', password: 'admin' }
];

// Passport setup
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }

    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Express middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'adlkhjasekklfj', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/uploads', express.static('uploads'));



app.get('/', async (req, res) => {
  try {
    const texts = await Text.find({});
    const images = await Image.find({}); // Fetch images from the database
    res.render('index', { texts, images }); // Pass both texts and images to the template
  } catch (error) {
    console.error('Error fetching data:', error);
    res.render('index', { texts: [], images: [] }); // Pass empty arrays if there's an error
  }
});



app.post('/admin/addtext', isAdmin, async (req, res) => {
  try {
    // Create a new text document using the model
    const newText = new Text({ content: req.body.textcontent });
    // Save the text document in the database
    await newText.save();
    // Redirect back to the admin dashboard or wherever appropriate
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error saving text:', error);
    res.status(500).send('Error saving text');
  }
});

// Login and dashboard routes
app.get('/admin/login', (req, res) => {
  res.render('admin-login', { message: req.flash('error') });
});

app.post('/admin/login',
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
  })
);

app.get('/admin/dashboard', isAdmin, (req, res) => {
  res.render('admin-dashboard', { user: req.user });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
