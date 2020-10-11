const http = require('http')
const express = require('express')
const { ApolloServer, PubSub, gql } = require('apollo-server-express')
const resolvers = require('./resolvers')
const fs = require('fs')

const app = express()

let httpServer = undefined
let graphqlServer = undefined
let listenHost = process.env.EDGENAT_GRAPHQL_HOST || 'localhost'

start = async function () {
  const pubsub = new PubSub()
  graphqlServer = new ApolloServer({
    typeDefs: gql`
      ${fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')}
    `,
    resolvers,
    subscriptions: {
      path: '/',
    },
    context: (req) => ({
      ...req,
      requests: req,
      pubsub,
    }),
    introspection: true,
    playground: true,
  })
  graphqlServer.applyMiddleware({ app, path: '/' })

  httpServer = http.createServer(app)
  graphqlServer.installSubscriptionHandlers(httpServer)

  await new Promise(async (resolve, reject) => {
    httpServer.listen(4000, listenHost, async () => {
      resolve()
    })
  })
  process.on('SIGINT', async () => {
    await stop()
  })
}

stop = async function () {
  httpServer.close()
}

module.exports = { start, stop }
