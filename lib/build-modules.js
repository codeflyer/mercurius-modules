'use strict'

const path = require('path')
const { loadFiles } = require('@graphql-tools/load-files')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const S = require('fluent-json-schema')
const Ajv = require('ajv')

const {
  SCHEMA_EXPORT_TYPE_AST,
  SCHEMA_EXPORT_TYPE_EXECUTABLE,
  SCHEMA_EXPORT_TYPE_STRING
} = require('./constants')

const objectMerger = (acc, obj) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (!acc[key]) {
      acc[key] = {}
    }

    acc[key] = { ...acc[key], ...value }
  })

  return acc
}

const loadSchema = async (options) => {
  const schema =
    await loadFiles(
      path.join(options.modulesPath, '/**', options.schemas)
    )

  if (options.schemaFormat === SCHEMA_EXPORT_TYPE_EXECUTABLE) {
    return makeExecutableSchema({ typeDefs: schema })
  } else if (options.schemaFormat === SCHEMA_EXPORT_TYPE_AST) {
    return schema
  } else {
    return schema.map(s => s.loc.source.body).join('\n')
  }
}

const loadResolvers = async (options) => {
  const resolvers = (await loadFiles(
    path.join(options.modulesPath, '/**', options.resolvers)
  )).reduce(objectMerger, {})

  return resolvers
}

const loadLoaders = async (options) => {
  const loaders = (await loadFiles(
    path.join(options.modulesPath, '/**', options.loaders)
  )).reduce(objectMerger, {})

  return loaders
}

const loadSubscriptions = async (options) => {
  const subscriptions = (await loadFiles(
    path.join(options.modulesPath, '/**', options.subscriptions)
  )).reduce(objectMerger, {})

  return subscriptions
}

async function buildModules (options) {
  const ajv = new Ajv({ allErrors: true, useDefaults: true })
  const validationSchema = S.object()
    .prop('modulesPath', S.string().required())
    .prop('schemaFormat',
      S.string().enum([
        SCHEMA_EXPORT_TYPE_EXECUTABLE,
        SCHEMA_EXPORT_TYPE_AST,
        SCHEMA_EXPORT_TYPE_STRING])
        .default(SCHEMA_EXPORT_TYPE_STRING))
    .prop('schemas', S.string().default('*.graphql'))
    .prop('resolvers', S.string().default('resolvers.js'))
    .prop('subscriptions', S.string().default('subscriptions.js'))
    .prop('loaders', S.string().default('loaders.js'))

  const validate = ajv.compile(validationSchema.valueOf())

  validate(options)

  const schema = await loadSchema(options)
  const resolvers = await loadResolvers(options)
  const loaders = await loadLoaders(options)
  const subscriptions = await loadSubscriptions(options)

  return {
    schema,
    resolvers,
    loaders,
    subscriptions
  }
}

module.exports = buildModules
