const config = require('../config.json');

const env = process.env.NODE_ENV || 'development'
const envConfig = config[env];

// add env. config values to process.env
Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key]
});