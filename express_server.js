const express = require('express');
const app = express();
const PORT = 8080;

function generateRandomString() {
  return (Math.random().toString(20).substr(2, 6));
};

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  'b2xVn2' : 'http://www.lighthouselabs.ca',
  '9sm5xK' : 'http://www.google.com'
};

app.post('/urls', (req, res) => {
  console.log(req.body);
  // { longURL: 'http://www.doggo.com' }
  // console.log(req.body.longURL);
  key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  //console.log(urlDatabase);
  res.redirect(`/urls/${key}`);
  //res.send('Ok');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL] };
  console.log(templateVars);
  //console.log(req.body.longURL);
  res.render('urls_show', templateVars);
  //const longURL = templateVars[longURL];
  //res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
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