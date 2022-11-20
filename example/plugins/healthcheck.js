'use strict'

const fp = require('fastify-plugin')

const { version } = require('../../package.json')

async function runCheck (server) {
  return {
    version,
    serverTimestamp: new Date(),
    status: 'ok',
    memoryUsage: server.memoryUsage && server.memoryUsage()
  }
}

module.exports = fp(
  async function healthCheck (server) {
    server.register(require('@fastify/under-pressure'), {
      maxEventLoopDelay: 1000,
      maxHeapUsedBytes: 100000000,
      maxRssBytes: 100000000,
      maxEventLoopUtilization: 0.98,
      exposeStatusRoute: {
        routeResponseSchemaOpts: {
          version: { type: 'string' },
          serverTimestamp: { type: 'string' },
          status: { type: 'string' },
          memoryUsage: {
            eventLoopDelay: { type: 'number' },
            rssBytes: { type: 'number' },
            heapUsed: { type: 'number' },
            eventLoopUtilized: { type: 'number' }
          },
          db: { type: 'string' }
        },

        url: '/alive'
      },
      healthCheck: runCheck
    })
  }, {
    name: 'healthCheck'
  })
