const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

//Obj to store users (Test users to be removed)
const users = {
    TestUser1: {
      id: "TestUser1ID",
      email: "Tuser1@example.com",
      password: "Testpass1",
    },
    TestUser2: {
      id: "TestUser2ID",
      email: "Tuser2@example.com",
      password: "Testpass2",
    },
};

//storepasswords
function createUser(email, password) {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email,
      password
    };
    return userID;
}

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

//Database to store URLS that are made
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
    const templateVars = {
        urls: urlDatabase,
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
    res.render('urls_new');
})

//Route to urls_show template
app.get('/urls/:id', (req, res) => {
    const user = getUser(req);
    const shortURL = req.params.id;
  
    if (!urlDatabase[shortURL]) {
      res.status(404).send('Short URL not found');
      return;
    }
  
    const templateVars = {
      user,
      shortURL,
      longURL: urlDatabase[shortURL],
    };
  
    res.render('urls_show', templateVars);
});

//Post request to delete a url when button is pressed
app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
});

//Route to take a short url to the long url
app.get("/u/:id", (req, res) => {
    const shortURL = req.params.id;
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
})

// GET request to render the registration template
app.get("/register", (req, res) => {
    const user = users[req.cookies.user_id];
    const templateVars = {
        user: user
    };
    res.render("register", templateVars);
});

//Get request to render the login page
app.get('/login', (req, res) => {
    res.render('login');
});
  

//Post request for urls page
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;

    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`)
});

//Post request to send user to edit page
app.post('/urls/:id', (req, res) => {
    const id = req.params.id;
    const updatedLongURL = req.body.longURL;
    urlDatabase[id].longURL = updatedLongURL;
    res.redirect(`/urls/${id}`);
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

    //Add new user obj to the users obj
    users[id] = {
        id: id,
        email: email,
        password: password,
    }

    //Set a cookie for the new user's ID
    res.cookie('user_id', id)
    res.redirect('/urls')
})