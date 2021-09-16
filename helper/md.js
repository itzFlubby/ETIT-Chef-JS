function noStyle(pString){
	return "```" + pString + "```";
}

function widthStyle(pType, pString){
	return "```" + pType + "\n" + pString + "```";
}

module.exports = {
	noStyle, widthStyle
};
