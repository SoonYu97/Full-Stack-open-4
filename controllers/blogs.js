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

module.exports = blogsRouter