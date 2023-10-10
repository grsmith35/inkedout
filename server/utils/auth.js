const jwt = require('jsonwebtoken');

const secret = 'smopezfam1!';
const expiration = '2h';

module.exports = {
  authMiddleware: function({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token
        .split(' ')
        .pop()
        .trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.error('Invalid token');
    }

    return req;
  },
  signToken: function({ username, email }) {
    const payload = { username, email };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  }
};