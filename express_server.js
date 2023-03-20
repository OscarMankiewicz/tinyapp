///////////////////////////////////////////////////////
//SETUP FUNCTIONS
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');

//body-parser
app.use(express.urlencoded({ extended: true }));

//cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Makes ejs the view engine
app.set("view engine", "ejs");

//function to generate a random string
function generateRandomString() {
    let result = '';
    //All alphanumeric characters
    const chars ='AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
    const charsLength = chars.length;

    //for loop to pick 6 random characters
    for(let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}


///////////////////////////////////////////////////////
//GET POST and other functions


//Obj to store users
const users = {
    
};

function getUserByEmail(email) {
    for (const userID in users) {
      if (users[userID].email === email) {
        return users[userID];
      }
    }
    return null;
}
 
function checkPassword(password, hashedPassword) {
    return password === hashedPassword;
}

function getUser(req) {
    const userId = req.cookies.user_id;
    return users[userId];
}

const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW",
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW",
    },
};

//attaches url to user
function urlsForUser(id, urlDatabase) {
    let usersURLs= {}

    for (const shortURL in urlDatabase) {
        if(urlDatabase[shortURL].userID === id) {
            usersURLs[shortURL] = urlDatabase[shortURL];
        }
    }
    return usersURLs;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Route to urls_index template
app.get("/urls", (req, res) => {
    const user = users[req.cookies.user_id];
    const usersURLs = urlsForUser(user, urlDatabase);
    const templateVars = {
        urls: usersURLs,
        user
    };

    res.render("urls_index", templateVars);
});

// Set a cookie when a new user registers or logs in
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email);
    if (user && checkPassword(password, user.password)) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.status(403).send("Incorrect email or password");
    }
});
  
//Post request to handle user logout
app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
})

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

//Route to urls_show template
app.get('/urls/:id', (req, res) => {
    const user = getUser(req);
    const shortURL = req.params.id;
    const usersURLs = urlsForUser(user, urlDatabase);
    const id = req.params.id;

    if(!user || !usersURLs) {
        res.redirect('/login')
    }

    if(!usersURLs) {
        res.status(401).send('This is not your url')
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

//Post request to delete a url when button is pressed
app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    const user = users[req.cookies.user_id];
    const shortURL = req.params.id;

    if (user !== urlDatabase[shortURL].userID) {
        res.status(401).send('You cannot do that');
    } else {
        delete urlDatabase[id];
        res.redirect("/urls");
    }
});

//Route to take a short url to the long url
app.get("/u/:id", (req, res) => {
    const shortURL = req.params.id;
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
});

// GET request to render the registration template
app.get("/register", (req, res) => {
    const user = users[req.cookies.user_id];
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
    const user = users[req.cookies.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user
    };
    res.render('login', templateVars);
  }
});

//Post request for urls page
app.post("/urls", (req, res) => {
    const user = users[req.cookies.user_id]
    if (!user) {
        return res.status(401).send('You need to be logged in to create new urls')
    }
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {longURL,userID:user};
    res.redirect(`/urls/${shortURL}`)
});

//Post request to send user to edit page
app.post('/urls/:id', (req, res) => {
    const id = req.params.id;
    if (!urlDatabase[shortURL]) {
        res.status(404).send('This URL does not exist')
    }

    if (user !== urlDatabase[shortURL].userID) {
        res.status(401).send('This does not belong to you')
    } else {
        const updatedLongURL = req.body.longURL;
        urlDatabase[id].longURL = updatedLongURL;
        res.redirect(`/urls/${id}`);
    }
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
    res.cookie('user_id', id)
    res.redirect('/urls')
})