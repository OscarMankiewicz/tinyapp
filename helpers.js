const bcrypt = require('bcryptjs');

const users = {
    
};

function getUserByEmail(email, users) {
    for (const userID in users) {
      if (users[userID].email === email) {
        return users[userID];
      }
    }
    return undefined;
}

function checkPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

function getUser(req) {
    const userId = req.session.user_id;
    return users[userId];
}

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

module.exports = { getUserByEmail, checkPassword, getUser, users, generateRandomString, urlsForUser };