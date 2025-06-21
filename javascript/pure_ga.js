function article_view(id, title) {
	console.log("id: " + id + "\n" + "title: " + title);

	// id 獨立送，預期會成為全域參數
	gtag('set', {
		id: id
	});

	gtag('event', 'article_view', {
		id, id,
		title: title
	});
}

function article_read(percentage) {
	console.log("percentage: " + percentage);

	// 若 article_read 先於 article_view 執行，則 id 為 undefined，只會送 percentage
	gtag('get', 'G-21E2TF2BFB', 'id', (id) => {
		gtag('event', 'article_read', {
			id, id,
			percentage: percentage
		});
	})
}
