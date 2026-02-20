function sortStringsIgnoringSpaces(stringsArray) {
    return [...stringsArray].sort((a, b) => {
        const strA = a.replace(/\s+/g, '');
        const strB = b.replace(/\s+/g, '');
        if (strA < strB) return -1;
        if (strA > strB) return 1;
        return 0;
    });
}

module.exports = sortStringsIgnoringSpaces;