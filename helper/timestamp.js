function formatTimestamp(pTimestamp){
	const formttedTimestamp = new Date(pTimestamp);
	return `${formttedTimestamp.getDate()}.${formttedTimestamp.getMonth() + 1}.${formttedTimestamp.getFullYear()} um ${formttedTimestamp.getHours()}:${formttedTimestamp.getMinutes()}:${formttedTimestamp.getSeconds()}`
}

module.exports = {
	formatTimestamp
};