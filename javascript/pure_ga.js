// 初始化 id = 0
gtag('config', '<G-21E2TF2BFB>', {
	id: 0
});

function article_view(id, title) {
	console.log("id: " + id + "\n" + "title: " + title);

	// id 獨立送，預期會成為全域變數
	gtag('set', {
		id: id
	});

	// title 跟著事件一起送，預期會成為區域變數
	gtag('event', 'article_view', {
		id, id,
		title: title
	});
}

function article_read(percentage) {
	console.log("percentage: " + percentage);

	gtag('get', 'G-21E2TF2BFB', 'id', (id) => {
		gtag('event', 'article_read', {
			percentage: percentage
		});
	})
}
