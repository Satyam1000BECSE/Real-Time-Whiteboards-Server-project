//======= utils session.js=========
const { v4: uuidv4 } = require('uuid');

function createSession() {
  return uuidv4(); // generates a unique session ID
}

module.exports = { createSession };