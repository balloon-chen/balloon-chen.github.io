function mapping_test_event(id, params) {
	console.log("id: " + id + "\n" + "params: " + params);

	if (id === 1) {
		dataLayer.push({
			event: 'mapping_test_event'+id,
			id: id,
			title: params
		})
	} else {
		dataLayer.push({
			event: 'mapping_test_event'+id,
			id: id,
			percentage: params
		})
	}
}
