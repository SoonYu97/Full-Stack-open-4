const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
	await Blog.deleteMany({})

	const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog))
	const promiseArray = blogObjects.map((blog) => blog.save())
	await Promise.all(promiseArray)
})

describe('blog ', () => {
	test('are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('have a unique identifier property named id', async () => {
		const blogs = await helper.blogsInDb()
		expect(blogs[0].id).toBeDefined()
		expect(blogs[0]._id).toBeUndefined()
	})

	test('can be added', async () => {
		const newBlog = {
			title: 'Nextjs patterns',
			author: 'Michael Chan',
			url: 'https://nextjs.org/',
			likes: 17,
		}
		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const response = await api.get('/api/blogs')

		const titles = response.body.map(r => r.title)
		expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
		expect(titles).toContain(
			'Nextjs patterns'
		)
	})
})
afterAll(async () => {
	await mongoose.connection.close()
})
