<<<<<<< HEAD
require('dotenv').config();

const knex = require('knex');
const config = require('./knexfile');

const environment = process.env.NODE_ENV || 'development';

module.exports = knex(config[environment] || config.development);
=======
require("dotenv").config();

const knex = require("knex");
const knexConfig = require("./knexfile");

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];

module.exports = knex(config);

>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
