module.exports = {
    tokenizeString: {
        explodeWords: {
            input: "one (two);one\nthree one four\\one two",
            output: {one: 4, two: 2, three: 1, four: 1}
        },
        explodeSymbols: {
            input: "<< != <= & || /+",
            output: {"<": 2, "!=": 1, "<=": 1, "||": 1, "/": 1, "+": 1}
        },
        explodeBoth: {
            input: "one == two && four-two=1",
            output: {one: 1, "==": 1, two: 2, "&&": 1, four: 1, "-": 1, "=": 1, 1: 1}
        },
        explodeCode: {
            input: `\
while(true) {
    if(getServerMoneyAvailable('foodnstuff') > 200000) {
        hack('foodnstuff');
    } else {
        grow('foodnstuff');
    };
};
while(true) {
    if(getServerMoneyAvailable('sigma-cosmetics') > 200000) {
        hack('sigma-cosmetics');
    } else {
        grow('sigma-cosmetics');
    };
};`,
            output: {
                while: 2,
                true: 2,
                if: 2,
                getServerMoneyAvailable:2,
                foodnstuff: 3,
                ">": 2,
                "200000": 2,
                hack: 2,
                else: 2,
                grow: 2,
                sigma: 3,
                "-": 3,
                "cosmetics": 3
            }
        }
    },
    countOccurrences: {
        pullCache: {
            stub: () => {
                const retVal = {};
                retVal[require("btoa")("some string")] = {some: 7};
                return retVal;
            },
            input: ["some string", "some"],
            output: 7
        }
    }
};
