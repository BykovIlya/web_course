function store(source) {
	localStorage["tetris.username"] = source.value;
}

function read(source) {
	source.value = localStorage["tetris.username"];
}