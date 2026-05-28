function article_view(id, title) {
	console.log("id: " + id + "\n" + "title: " + title);

	dataLayer.push({
		event: 'article_view',
		id: id,
		title: title
	})
}

function article_read(percentage) {
	console.log("percentage: " + percentage);

	dataLayer.push({
		event: 'article_read',
		percentage: percentage
	})
}
