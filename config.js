var env = require('twelve/env');

module.exports = env({
    'host': {
      name: 'S3PROXY_HOST',
      required: false
    },
    'port': 'S3PROXY_PORT',
    'key': 'AWS_KEY',
    'secret': 'AWS_SECRET',
    'bucket':  'AWS_S3BUCKET'
});

