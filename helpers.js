const getUserByEmail = function(email, users) {
  // lookup magic...
  for (const key in users) {
    if(users[key].email === email) {
      return users[key];
    }
  }
};

module.exports = getUserByEmail;
// export { getUserByEmail }

// module.exports = {
//   getUserByEmail: getUserByEmail
// };