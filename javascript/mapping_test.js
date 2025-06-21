function mapping_test_event(id, params) {
	console.log("params: " + params);

	if (id === 1) {
		dataLayer.push({
			event: 'mapping_test_event'+id,
			id: 'mapping_key',
			title: params
		})
	} else {
		dataLayer.push({
			event: 'mapping_test_event'+id,
			id: 'mapping_key',
			percentage: params
		})
	}
}
