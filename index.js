'use strict'

const {
  SCHEMA_EXPORT_TYPE_STRING, SCHEMA_EXPORT_TYPE_EXECUTABLE, SCHEMA_EXPORT_TYPE_AST
} = require('./lib/constants')
const buildModules = require('./lib/build-modules')

module.exports = { buildModules, SCHEMA_EXPORT_TYPE_STRING, SCHEMA_EXPORT_TYPE_EXECUTABLE, SCHEMA_EXPORT_TYPE_AST }
