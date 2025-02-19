const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pantry Helper API',
      version: '1.0.1',
      description: 'API documentation for Pantry Helper'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://www.pantry-helper.com'
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ]
  },
  apis: ['./routes/*.js']
}

const specs = swaggerJsdoc(options)

module.exports = specs
