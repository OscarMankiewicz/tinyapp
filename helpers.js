function getUserByEmail(email, users) {
    for (const userID in users) {
      if (users[userID].email === email) {
        return users[userID];
      }
    }
    return null;
}

module.exports = { getUserByEmail };