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
	const { _id, url, __v, ...favoriteBlog} = blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current, {})
	return favoriteBlog
}
  
module.exports = {
	dummy,
	totalLikes,
	favoriteBlog
}