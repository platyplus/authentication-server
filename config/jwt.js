var fs = require('fs')
// Key Identifier – Acts as an ‘alias’ for the key
exports.kid =
  process.env.AUTH_KEY_ID || '91fc60858e1c7654321216d53dd179fa41f8430c'

// TODO: why does rsaPemToJwk work with a file but not with a variable?
exports.key = (
  process.env.AUTH_PRIVATE_KEY || fs.readFileSync('private.pem')
).replace(/\\n/g, '\n')
