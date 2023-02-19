const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
	response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
	const user = request.user

	const body = request.body

	if (body['title'] && body['url']) {
		const blog = new Blog({
			title: body.title,
			url: body.url,
			author: body.author || '',
			likes: body.likes || 0,
			user: user.id,
		})
		const savedBlog = await blog.save()

		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save()
		return response.status(201).json(savedBlog)
	}
	response.status(400).end()
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
	const user = request.user

	const blog = await Blog.findById(request.params.id)

	if (blog.user.toString() === user.id.toString()) {
		await Blog.findByIdAndUpdate(request.params.id)
		const updatedBlog = await Blog.findByIdAndUpdate(
			request.params.id,
			request.body,
			{ new: true }
		)
		return response.json(updatedBlog)
	} else {
		return response.status(401).json({
			error: 'invalid username or password',
		})
	}
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
	const user = request.user

	const blog = await Blog.findById(request.params.id)

	if (blog.user.toString() === user.id.toString()) {
		await Blog.findByIdAndRemove(request.params.id)
	} else {
		return response.status(401).json({
			error: 'invalid username or password',
		})
	}
	response.status(204).end()
})

module.exports = blogsRouter
