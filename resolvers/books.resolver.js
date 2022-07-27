module.exports = {
	Query: {
		books: async (root, args, { db, user }) => {
			if (!user) return []
			let limit = args.limit || -1
			let offset = 0
			if (args.page && args.limit > 0) {
				offset = (args.page - 1) * limit
			}
			let books = await db.book.findAll({ include: [db.genre, 'history'], limit, offset })
			return books
		},
		findBooksByAuthor: async (root, args, { db }) => {
			let books = await db.book.findAll({ where: { author: args.author }, include: [db.genre, 'history'] })
			return books
		},
		findBooksByTitle: async (root, args, { db }) => {
			let books = await db.book.findAll({ where: { title: args.title }, include: [db.genre, 'history'] })
			return books
		},
		genres: async (root, args, { db, user }) => {
			if (!user) return []
			let genres = await db.genre.findAll()
			return genres
		},
	},
	BookHistory: {
		genres: async (bookHistory) => {
			return bookHistory.genres.split(',')
		},
	},
	Mutation: {
		createBook: async (root, args, { db, user }) => {
			if (!user) {
				return {
					success: false,
					message: 'You must be logged in to create a book',
				}
			}
			let book = await db.book.create(args.book)
			if (!book) {
				return {
					success: false,
					message: 'There was an error creating the book',
				}
			}
			if (args.book.genres) {
				for (let genre of args.book.genres) {
					let [genreObj, created] = await db.genre.findOrCreate({ where: { name: genre.name } })
					let newGenre = await book.addGenre(genreObj)
					if (!newGenre) {
						return {
							success: false,
							message: 'The book was created but there was an error adding the genre',
						}
					}
				}
			}

			await book.reload({ include: [db.genre] })
			return {
				success: true,
				message: 'Book created',
				book: book,
			}
		},
		updateBook: async (root, args, { db, user }) => {
			if (!user) {
				return {
					success: false,
					message: 'You must be logged in to update a book',
				}
			}
			let book = await db.book.findByPk(args.id, { include: [db.genre] })

			if (book) {
				// Generate genres string for book history
				let genres = []
				book.genres.forEach((genre) => {
					genres.push(genre.name)
				})
				genres = genres.join(',')

				// Create book history before updating book
				let bookHistory = await db.book_history.create({
					title: book.title,
					author: book.author,
					year: book.year,
					rating: book.rating,
					genres: genres,
				})
				await book.addHistory(bookHistory)

				// Update book
				await book.update(args.book)

				// Update book genres only if genres are provided
				if (args.book.genres) {
					let newGenres = []
					for (let genre of args.book.genres) {
						let [genreObj, created] = await db.genre.findOrCreate({ where: { name: genre.name } })
						newGenres.push(genreObj)
					}
					await book.setGenres(newGenres)
				}

				// Reload book with updated genres
				await book.reload({ include: [db.genre] })
				return { success: true, message: 'Book updated', book: book }
			} else {
				return { success: false, message: 'Book not found' }
			}
		},
		deleteBook: async (root, args, { db, user }) => {
			if (!user) {
				return {
					success: false,
					message: 'You must be logged in to delete a book',
				}
			}
			let book = await db.book.destroy({ where: { id: args.id } })
			// Book successfully deleted
			if (book) {
				return {
					success: true,
					message: `Book with id ${args.id} successfully deleted`,
					deletedBookId: args.id,
				}
			} else {
				return {
					success: false,
					message: `Book with id ${args.id} not found`,
					deletedBookId: null,
				}
			}
		}
	},
}