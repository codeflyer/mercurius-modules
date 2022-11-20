'use strict'

const path = require('path')
const mercurius = require('mercurius')
const fp = require('fastify-plugin')

const { buildModules, SCHEMA_EXPORT_TYPE_STRING } = require('../../index.js')

module.exports = fp(
  async (fastify, options) => {
    const {
      schema,
      resolvers,
      loaders,
      subscriptions
    } = await buildModules(
      {
        modulesPath: path.resolve(__dirname, '../modules/'),
        schemaFormat: SCHEMA_EXPORT_TYPE_STRING
      }
    )

    const mercuriusOptions = {
      graphiql: {
        enabled: true
      },
      schema,
      resolvers,
      loaders,
      subscriptions,
      federationMetadata: true,
      context: async () => {
        return {
          app: fastify,
          config: fastify.config,
          logger: fastify.log
        }
      }
    }

    fastify.register(mercurius, mercuriusOptions)

    fastify.get('/sdl', async function () {
      const query = '{ _service { sdl } }'
      return fastify.graphql(query)
    })
  },
  {
    name: 'mercurius'
  }
)
