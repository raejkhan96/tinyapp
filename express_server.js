const express = require('express');
const app = express();
const PORT = 8080;
const getUserByEmail = require('./helpers.js');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');

// remove cookie Parser?
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser()); ?
app.use(cookieSession({
  name: 'session',
  keys: ['secret-keys'],

  // Cookie Options ?
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// 'DATABASE'/OBJECTS --------------------------------

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1"
  }
};

// FUNCTIONS ---------------------------------------------------------

const getUser = function(req) {
  console.log('GET USER FUNCTION: ', req.session.user_id);
  const user = req.session.user_id ? users[req.session.user_id] : null;
  return user;
};

const urlsForUser = function(id) {
  const filteredDB = {};

  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      filteredDB[key] = urlDatabase[key];
    }
  }

  return filteredDB;
};

const generateRandomString = function() {
  return (Math.random().toString(20).substr(2, 6));
};

const createNewUser = function(userId, email, password) {
  if (!email || !password) {
    return { status: 400, error: 'There is an empty field', data: null };
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  for (const id in users) {
    if (users[id].email === email) {
      return {  status: 400, error: 'This email is already in use', data: null };
    }
  }
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  console.log(users);
  return {error: null, data: {userId, email, hashedPassword}};
};


// POSTS -------------------------------------

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const userVal = createNewUser(userId, email, password);
  
  if (userVal.error) {
    return res.send(userVal.error);
  }

  req.session.user_id = userId;
  res.redirect(`/urls`);
});

app.post('/urls', (req, res) => {
  if (!req.session['user_id']) {
    res.send('Error: User is not logged in ');
  }

  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session['user_id'],
  };
  
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(403).send('Error: There is an empty field');
    return;
  }

  const user = getUserByEmail(email, users);

  if (typeof user === 'undefined') {
    res.status(403).send('Error: Incorrect username or password');
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Error: Incorrect password');
    return;
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//:id is the wildcard
app.post('/urls/:id', (req, res) => {
  if (!req.session['user_id']) {
    const templateVars = {
      msg: 'Error: Does Not Exist'
    };
    res.render('error', templateVars);
    return;
  }

  const shortURL = req.params.id;
  const longURL = req.body.longURL;

  urlDatabase[shortURL].longURL = longURL;

  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  
  if (!req.session['user_id']) {
    const templateVars = {
      msg: 'Error: Does Not Exist'
    };
    res.render('error', templateVars);
    return;
  }
  
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');

});

// GET ----------------------------------------

app.get('/register', (req, res) => {
  const user = getUser(req);

  if (user) {
    res.redirect('/urls');
    return;
  }

  res.render('register');
});

app.get('/urls', (req, res) => {
  const user = getUser(req);
  if (!user) {
    res.send('Error: Not logged in');
    return;
  }

  const filteredDB = urlsForUser(user.id);

  const templateVars = {
    user_id: users[req.session['user_id']],
    user: user,
    urls: filteredDB,
  };

  res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/urls/new', (req, res) => {
  const user = getUser(req);
  if (!user) {
    res.redirect('/login');
    return;
  }

  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render('urls_new', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
    
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);

});

app.get('/urls/:shortURL', (req, res) => {

  const user = getUser(req);
  if (!user) {
    res.send('Error: Not logged in');
    return;
  }
  
  const url = urlDatabase[req.params.shortURL];
  if (!url || user.id !== url.userID) {
    res.send('Error: Url Does Not Exist');
    return;
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    user: user,
    longURL: url,
  };
  
  res.render('urls_show', templateVars);
});

app.get('/', (req, res) => {
  res.redirect('login');
});

// USELESS ---------------------------------

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});