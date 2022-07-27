const { ApolloServer, gql } = require('apollo-server')
const { Sequelize, Model, DataTypes } = require('sequelize')
const jwt = require('jsonwebtoken')
const { loadFiles, loadFilesSync } = require('@graphql-tools/load-files')

const models = require('./models')
const { getIntrospectionQuery } = require('graphql')

async function main() {

	await models.sequelize.sync({ force: true })

	const genres = await models.genre.bulkCreate([{ name: 'Fantasy' }, { name: 'Sci-Fi' }, { name: 'Romance' }, { name: 'Mystery' }, { name: 'Thriller' }, { name: 'Horror' }, { name: 'Drama' }, { name: 'Biography' }, { name: 'History' }, { name: 'Western' }])

	let book1 = await models.book.create({
		title: 'Harry Potter and the Chamber of Secrets',
		author: 'J.K. Rowling',
		year: 1998,
		rating: 5,
	})
	await book1.addGenres(genres.slice(0, 3))

	let book2 = await models.book.create({
		title: 'Jurassic Park',
		author: 'Michael Crichton',
		year: 1993,
		rating: 5,
	})
  await book2.addGenres(genres.slice(3, 6))


	// The ApolloServer constructor requires two parameters: your schema
	// definition and your set of resolvers.
	const server = new ApolloServer({
		typeDefs: await loadFiles('typeDefs/**/*.graphql'),
		resolvers: await loadFiles('resolvers/**/*.{js,ts}'),
		csrfPrevention: true,
		cache: 'bounded',
		context: async ({ req }) => {
      let user = await getUser(req.headers.authorization.split(" ")[1] || '')
			return { user, db: models }
		},
	})

	// The `listen` method launches a web server.
	server.listen().then(({ url }) => {
		console.log(`🚀  Server ready at ${url}`)
	})
}

main()

let getUser = async function(token) {
  try {
    let decoded = jwt.verify(token, 'SECRET_KEY')
    return await models.user.findByPk(decoded.id)
  } catch (err) {
    console.log(err)
  }
}
