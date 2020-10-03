const http = require('http')
const express = require('express')
const { ApolloServer, PubSub, gql } = require('apollo-server-express')
const resolvers = require('./resolvers')
const fs = require('fs')

const app = express()

let httpServer = undefined
let graphqlServer = undefined

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
  })
  graphqlServer.applyMiddleware({ app, path: '/' })

  httpServer = http.createServer(app)
  graphqlServer.installSubscriptionHandlers(httpServer)

  await new Promise(async (resolve, reject) => {
    httpServer.listen(4000, async () => {
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
