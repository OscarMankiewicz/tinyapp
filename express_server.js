const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//body-parser
app.use(express.urlencoded({ extended: true }));

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
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

//Route to urls_new template
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

//Route to urls_show template
app.get("/urls/:id", (req, res) => {
const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]}
    res.render("urls_show", templateVars)
});

//post request for urls page
app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
});