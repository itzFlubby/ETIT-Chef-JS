function formatTimestamp(pTimestamp){
	const formttedTimestamp = new Date(pTimestamp);
	return `${formttedTimestamp.getDate().toString().padStart(2, '0')}.${(formttedTimestamp.getMonth() + 1).toString().padStart(2, '0')}.${formttedTimestamp.getFullYear()} um ${formttedTimestamp.getHours().toString().padStart(2, '0')}:${formttedTimestamp.getMinutes().toString().padStart(2, '0')}:${formttedTimestamp.getSeconds().toString().padStart(2, '0')}`;
}

function formatDate(pDate){
	return `${pDate.getDate().toString().padStart(2, '0')}.${(pDate.getMonth() + 1).toString().padStart(2, '0')}.${pDate.getFullYear()}`;
}

module.exports = {
	formatTimestamp, formatDate
};