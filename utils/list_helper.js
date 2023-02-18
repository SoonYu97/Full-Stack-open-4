const _ = require('lodash')

const dummy = () => {
	return 1
}

const totalLikes = (blogs) => {
	const reducer = (sum, blog) => {
		return sum + blog.likes
	}

	return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
	const { _id, url, __v, ...favoriteBlog } = blogs.reduce(
		(prev, current) => (prev.likes > current.likes ? prev : current),
		{}
	)
	return favoriteBlog
}

const mostBlogs = (blogs) => {
	if (blogs.length === 0) {
		return {}
	}
	const authorCount = _.countBy(blogs, 'author')
	console.log(authorCount)
	const mostFrequentAuthor = _.maxBy(_.keys(authorCount), author => authorCount[author])
	return {author: mostFrequentAuthor, blogs: authorCount[mostFrequentAuthor]}
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
}
