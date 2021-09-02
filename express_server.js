const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// FUNCTIONS ---------------------------------------------------------

function generateRandomString() {
  return (Math.random().toString(20).substr(2, 6));
};

const createNewUser = function (userId, email, password) {
  if(!email || !password) {
    return { status: 400, error: 'There is an empty field', data: null };
  }
  for (const id in users) {
    if(users[id].email === email) {
      return {  status: 400, error: 'This email is already in use', data: null };
    }
  }
  users[userId] = {
    id: userId,
    email: email,
    password: password
  } 
  console.log(users);
  return {error: null, data: {userId, email, password}};
}

// 'DATABASE'/OBJECTS --------------------------------

const urlDatabase = {
  'b2xVn2' : 'http://www.lighthouselabs.ca',
  '9sm5xK' : 'http://www.google.com'
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
}

// POSTS -------------------------------------

app.post('/register', (req, res) => {
  console.log(req.body);
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const userVal = createNewUser(userId, email, password);
  if (userVal.error) {
    return res.send(userVal.error)
  }
  console.log(userId, email, password)
  res.cookie('user_id', userId);
  console.log(users);
  res.redirect(`/urls`)
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.post('/login', (req, res) => {
  console.log(req.body.username);
  for (const id in users) {
    if(users[id].email === (req.body.username)) {
      user = req.body.username;
    }
  }
  console.log(user);
  const templateVars = {
    user: user,
  }
  res.cookie('user_id', templateVars);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//:id is the wildcard
app.post('/urls/:id', (req, res) => {
  console.log(req.params);
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// GET ----------------------------------------

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { 
    user: user,
    urls: urlDatabase
  };
  res.render('urls_new', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    user: user,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render('urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  console.log(req.cookies);
  const user = users[req.cookies.user_id];
  console.log(user);
  const templateVars = { 
    user_id: users[req.cookies['user_id']],
    user: user,
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

// USELESS ---------------------------------

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});