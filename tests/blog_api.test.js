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

	test('can be added without like and return 0 like', async () => {
		const newBlog = {
			title: 'Nextjs patterns',
			author: 'Michael Chan',
			url: 'https://nextjs.org/',
		}
		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const response = await api.get('/api/blogs')

		const blog = response.body.find(r => r.title === 'Nextjs patterns')
		expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
		expect(blog.likes).toBeDefined()
		expect(blog.likes).toBe(0)
	})

	test('cannot be added without title or url', async () => {
		const newBlog = {
			author: 'Michael Chan',
		}
		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(400)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})
