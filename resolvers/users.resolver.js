const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
	Mutation: {
		registerUser: async (root, args, { db }) => {
			// Check if user already exists
			let alreadyExists = await db.user.findOne({ where: { username: args.user.username } })
			if (alreadyExists) {
				return {
					success: false,
					message: 'User already exists',
				}
			}
			let hashedPassword = await bcrypt.hash(args.user.password, 10)
			let user = await db.user.create({ username: args.user.username, password: hashedPassword })
			if (!user) {
				return {
					success: false,
					message: 'There was an error creating the user',
				}
			}
			return {
				success: true,
				message: 'User created',
				userId: user.id,
			}
		},
		loginUser: async (root, args, { db }) => {
			let user = await db.user.findOne({ where: { username: args.user.username } })
			let isValidPassword = await bcrypt.compare(args.user.password, user?.password || '')
			if (!user || !isValidPassword) {
				return {
					success: false,
					message: 'Invalid username or password',
				}
			}
			return {
				success: true,
				message: 'User successfully logged in',
				userId: user.id,
				token: jwt.sign({ id: user.id, username: user.username }, 'SECRET_KEY', { expiresIn: '2h' }),
			}
		},
	},
}