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

describe('when there is initially some blogs saved ', () => {
	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('blogs have a unique identifier property named id', async () => {
		const blogs = await helper.blogsInDb()
		expect(blogs[0].id).toBeDefined()
		expect(blogs[0]._id).toBeUndefined()
	})

})

describe('addition of a new blog', () => {
	test('succeeds with valid data', async () => {
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

	test('succeeds without likes and return 0 likes', async () => {
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

	test('fails with status code 400 if without title or url', async () => {
		const newBlog = {
			author: 'Michael Chan',
		}
		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(400)
	})
})

describe('update of a blog', () => {
	test('succeeds if id is valid', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToUpdate = blogsAtStart[0]
		blogToUpdate.likes += 20

		await api
			.put(`/api/blogs/${blogToUpdate.id}`)
			.send(blogToUpdate)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()

		expect(blogsAtEnd).toHaveLength(
			helper.initialBlogs.length
		)

		const titles = blogsAtEnd.map(r => r.title)

		expect(titles).toContain(blogToUpdate.title)

		const blogAtEnd = blogsAtEnd.find(r => r.title === blogToUpdate.title)

		expect(blogAtEnd.likes).toBe(blogToUpdate.likes)
	})
})


describe('deletion of a blog', () => {
	test('succeeds with status code 204 if id is valid', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToDelete = blogsAtStart[0]

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.expect(204)

		const blogsAtEnd = await helper.blogsInDb()

		expect(blogsAtEnd).toHaveLength(
			helper.initialBlogs.length - 1
		)

		const titles = blogsAtEnd.map(r => r.title)

		expect(titles).not.toContain(blogToDelete.title)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})
