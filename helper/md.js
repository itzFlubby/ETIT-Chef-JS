function noStyle(pString){
	return "```" + pString + "```";
}

function withStyle(pType, pString){
	return "```" + pType + "\n" + pString + "```";
}

module.exports = {
	noStyle, withStyle
};
