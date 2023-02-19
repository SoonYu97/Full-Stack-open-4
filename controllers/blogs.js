const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
	response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
	const blogBody = request.body
	blogBody['likes'] = blogBody['likes'] || 0
	if (blogBody['title'] && blogBody['url']) {
		const blog = new Blog(blogBody)
		const savedBlog = await blog.save()
		return response.status(201).json(savedBlog)
	}
	response.status(400).end()
})

blogsRouter.put('/:id', async (request, response) => {
	const updatedBlog = await Blog
		.findByIdAndUpdate(request.params.id, request.body, { new: true })
	response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
	await Blog.findByIdAndRemove(request.params.id)
	response.status(204).end()
})

module.exports = blogsRouter