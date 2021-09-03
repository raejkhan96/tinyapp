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

const checkExistingUser = function (email, password) {
  if(!email || !password) {
    return { status: 403, error: 'There is an empty field', data: null };
  }

  for (const name in users) {
    // console.log(users[name])
    console.log(users[name].email, email, users[name].password, password)
    if(users[name].email === (email)){
      console.log(users[name].email, email)
      if(users[name].password === (password)) {
        console.log(users[name].password, password)
        user_id = users[name].id;
        user = email;
        password = password;
        const templateVars = {
          user_id: user_id,
          user: user, 
          password: password
        }
        return { error: null, data: templateVars};
      } else {
      return {  status: 403, error: 'Incorrect password', data: null };
      }
    } 
  }
  return { status: 403, error: 'User not registered', data: null};  
}

// 'DATABASE'/OBJECTS --------------------------------

// const urlDatabase = {
//   'b2xVn2' : 'http://www.lighthouselabs.ca',
//   '9sm5xK' : 'http://www.google.com'
// };

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
  if (!req.cookies['user_id']) {
    res.send('Error: User is not logged in')
  }
  console.log('/URLS!!!!!')
  console.log(req.body);
  console.log(req.params)
  key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id'],
  }
  res.redirect(`/urls/${key}`);
});

app.post('/login', (req, res) => {
  console.log('/login');
  console.log('!!!!!!!!!!!')
  console.log(req.body);
  console.log(users);

  const email = req.body.email;
  const password = req.body.password;

  console.log(email);
  console.log(password);

  const userVal = checkExistingUser(email, password);
  console.log(userVal);
  if (userVal.error) {
    return res.send(userVal.error)
  }

  console.log(user_id, user, password);
  
  res.cookie('user_id', user_id);
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
  console.log('URLS/ID!!!!')
  console.log('shortURL: ', shortURL)
  console.log('longURL: ',longURL)
  urlDatabase[shortURL].longURL = longURL;

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

app.get('/login', (req, res) => {
  res.render('login');
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
  if(!urlDatabase[req.params.shortURL]) {
    res.render('error')
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
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