function markdownFormat(string, bold = false, inline = false) {
	let prefix = "";
	let suffix = "";

	if (bold) {
		prefix += "**";
		suffix = "**" + suffix;
	}

	if (inline) {
		prefix += "`";
		suffix = "`" + suffix;
	}

	return `${prefix}${string}${suffix}`;
}

module.exports = {markdownFormat};