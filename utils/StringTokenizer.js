module.exports = class StringTokerizer {
    constructor(cache = {}) {
        this.cache = cache;
        this.btoa = require("btoa");
    }

    /**
     * Breaks down a string and counts the usage of all words in the string. Returns
     * an object whose property names are the words and values are the counts. Note
     * the `\b\w+\b` will find a word character, then grab as many word characters
     * as possible, i.e. this won't do substrings.
     * @param  {string} stringToParse
     * The string to parse.
     * @return {Object}
     * An object containing word: count pairs or nothing if the string is empty.
     * @see [MDN `RegExp.prototype.exec()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)
     */
    tokenizeString(stringToParse) {
        // Ensure we're working with a string
        stringToParse = (stringToParse || "").toString();
        var tokens = {};
        // Look for words or specific symbols
        var word = /(\b\w+\b|[!><=]=?|[\+\-\*\/\%]|[\&\|]{2})/g;
        var results = [];
        // Run until exec consumes the whole string
        while ((results = word.exec(stringToParse)) !== null) {
            // Convenience
            var foundWord = results[0];
            if (!tokens[foundWord]) {
                tokens[foundWord] = 0;
            }
            tokens[foundWord]++;
        }
        return tokens;
    }

    /**
     * Returns the number of occurrences of a substring inside a string
     * @param  {string} haystack
     * The string to search
     * @param  {string} needle
     * The substring to count
     * @return {number}
     * The number of occurrences of `needle` inside `haystack`.
     */
    countOccurrences(haystack, needle) {
        // Ensure we're working with strings
        haystack = (haystack || "").toString();
        needle = (needle || "").toString();
        if (haystack.length > 0 && needle.length > 0) {
            var base64Rep = this.btoa(haystack);
            if (!this.cache[base64Rep]) {
                this.cache[base64Rep] = this.tokenizeString(haystack);
            }
            return this.cache[base64Rep][needle] || 0;
        }
        return 0;
    }

};
