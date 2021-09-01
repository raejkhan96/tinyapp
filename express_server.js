const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

function generateRandomString() {
  return (Math.random().toString(20).substr(2, 6));
};

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const urlDatabase = {
  'b2xVn2' : 'http://www.lighthouselabs.ca',
  '9sm5xK' : 'http://www.google.com'
};

app.post('/urls', (req, res) => {
  console.log(req.body);
  key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
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

app.get('/urls/new', (req, res) => {
  const templateVars = { 
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_new', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

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