window.dataLayer = window.dataLayer || [];

function gtag() {
	window.dataLayer.push(arguments);
}

function article_view(id, title) {
	console.log("id: " + id + "\n" + "title: " + title);

	// id 獨立送，預期會成為全域變數
	gtag('set', {
		id: id
	});

	// title 跟著事件一起送，預期會成為區域變數
	gtag('event', 'article_view', {
		title: title
	});
}

function article_read(percentage) {
	console.log("percentage: " + percentage);

	// percentage 跟著事件一起送，預期會成為區域變數
	gtag('event', 'article_read', {
		percentage: percentage
	});
}
