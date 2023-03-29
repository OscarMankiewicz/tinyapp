///////////////////////////////////////////////////////
//SETUP FUNCTIONS
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const { getUserByEmail, checkPassword, getUser, users, generateRandomString, urlsForUser,urlDatabase } = require('./helpers')

//body-parser
app.use(express.urlencoded({ extended: true }));

//cookie session
const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
}));

//Makes ejs the view engine
app.set("view engine", "ejs");


///////////////////////////////////////////////////////
//GET 

app.get("/", (req, res) => {
    const user = getUser(req);
    if (!user) {
        res.redirect('login')
    } else {
        res.redirect('urls');
    }
});

//Route to urls_index template
app.get("/urls", (req, res) => {
    const user = users[req.session.user_id];
    const usersURLs = urlsForUser(user, urlDatabase);
    const templateVars = {
        urls: usersURLs,
        user
    };

    res.render("urls_index", templateVars);
});

//Route to urls_new template
app.get('/urls/new', (req, res) => {
    const user = getUser(req);
    const templateVars = {
        user
    }
    if (!user) {
        res.redirect('login')
    } else {
        res.render('urls_new', templateVars);
    }
})



// GET request to render the registration template
app.get("/register", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        res.redirect('/urls')
    } else {
        const templateVars = {
            user
        };
        res.render("register", templateVars);
    }
});

//Get request to render the login page
app.get('/login', (req, res) => {
    const user = users[req.session.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user
    };
    res.render('login', templateVars);
  }
});

//Route to urls_show template
app.get('/urls/:id', (req, res) => {
    const user = getUser(req);
    const shortURL = req.params.id;
    const usersURLs = urlsForUser(user, urlDatabase);
    const id = req.params.id;

    if(!user || !usersURLs) {
        res.redirect('/login');
        return;
    }

    if(!usersURLs) {
        res.status(401).send('This is not your url');
        return;
    }
  
    if (!urlDatabase[shortURL]) {
      res.status(404).send('Short URL not found');
      return;
    }

    const templateVars = {
      user,
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      id
    };
  
    res.render('urls_show', templateVars);
});

//Route to take a short url to the long url
app.get("/u/:id", (req, res) => {
    const shortURL = req.params.id;
    if (urlDatabase.hasOwnProperty(shortURL)) {
        const longURL = urlDatabase[shortURL].longURL;
        res.redirect(longURL);
    } else {
        res.status(404).send("URL not found");
    }
});


/////////////////////////////////////////////////////////////////////
//POST

//Post request for urls page
app.post("/urls", (req, res) => {
    const user = users[req.session.user_id]
    if (!user) {
        return res.status(401).send('You need to be logged in to create new urls')
    }
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {longURL,userID:user};
    res.redirect(`/urls/${shortURL}`)
});

//Post request to hande user registeration
app.post('/register', (req, res) => {
    const {email, password} = req.body;
    const id = generateRandomString();

    //Check if email or password box is empty
    if (!email || !password) {
        res.status(400).send("Boxes cannot be empty please Provide a password and email");
        return;
    }

    //Check if email already exists in the users obj
    for (const userId in users) {
        if (users[userId].email === email) {
            res.status(400).send("Email already exists.")
            return;
        }
    }

    //hashing password
    const hashedPassword = bcrypt.hashSync(password, 10);

    //Add new user obj to the users obj
    users[id] = {
        id: id,
        email: email,
        password: hashedPassword,
    }

    //Set a cookie for the new user's ID
    const user = getUserByEmail(email, users);
    req.session.user_id = user.id;
    res.redirect('/urls');
});

// Set a cookie when a new user registers or logs in
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email, users);
    if (user && checkPassword(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Incorrect email or password");
    }
});

//Post request to handle user logout
app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/urls');
})

//Post request to send user to edit page
app.post('/urls/:id', (req, res) => {
    const id = req.params.id;
    const shortURL = urlDatabase[id];
    if (!shortURL) {
        res.status(404).send('This URL does not exist');
    }


    const userID = users[req.session.user_id];
    if (!userID || userID !== shortURL.userID) {
        res.status(401).send('This URL does not belong to you');
    } else {
        const updatedLongURL = req.body.longURL;
        urlDatabase[id].longURL = updatedLongURL;
        res.redirect(`/urls/${id}`);
    }
});

//Post request to delete a url when button is pressed
app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    const user = users[req.session.user_id];
    const shortURL = req.params.id;

    if (user !== urlDatabase[shortURL].userID) {
        res.status(401).send('You cannot do that');
    } else {
        delete urlDatabase[id];
        res.redirect("/urls");
    }
});

app.listen(PORT, () => {
});