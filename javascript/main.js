window.dataLayer = window.dataLayer || [];

function article_view(id, title) {
	console.log("id: " + id + "\n" + "title: " + title);

	// id 獨立送，預期會成為全域變數
	dataLayer.push({
		id: id
	});

	// title 跟著事件一起送，預期會成為區域變數
	dataLayer.push('event', 'article_view', {
		title: title
	});
}

function article_read(percentage) {
	console.log("percentage: " + percentage);

	// percentage 跟著事件一起送，預期會成為區域變數
	dataLayer.push('event', 'article_read', {
		percentage: percentage
	});
}
