const chai = require("chai");
const sinon = require("sinon");
// eslint-disable-next-line no-unused-vars
const should = chai.should();
// chai.use(require('chai-as-promised'));

const path = require("path");

const StringTokerizer = require(path.join(__dirname, "..", "utils", "StringTokenizer"));
const data = require(path.join(__dirname, "StringParsing.data"));

describe("StringTokerizer", () => {
    let tokenizer;

    beforeEach(() => {
        tokenizer = new StringTokerizer();
    });

    describe("tokenizeString()", () => {
        it("should return an empty object for an empty string", () => {
            const result = tokenizer.tokenizeString();
            result.should.deep.equal({});
        });

        it("should properly explode word strings", () => {
            const result = tokenizer.tokenizeString(data.tokenizeString.explodeWords.input);
            result.should.deep.equal(data.tokenizeString.explodeWords.output);
        });

        it("should properly explode symbol strings", () => {
            const result = tokenizer.tokenizeString(data.tokenizeString.explodeSymbols.input);
            result.should.deep.equal(data.tokenizeString.explodeSymbols.output);
        });

        it("should properly explode mixed strings", () => {
            const result = tokenizer.tokenizeString(data.tokenizeString.explodeBoth.input);
            result.should.deep.equal(data.tokenizeString.explodeBoth.output);
        });

        it("should properly explode code input", () => {
            const result = tokenizer.tokenizeString(data.tokenizeString.explodeCode.input);
            result.should.deep.equal(data.tokenizeString.explodeCode.output);
        });
    });

    describe("countOccurrences()", () => {
        let tokenizeStub;

        beforeEach(() => {
            tokenizeStub = sinon.stub(tokenizer, "tokenizeString")
                .returns({word: 3});
        });

        it("should pull cached values", () => {
            let cacheStub = sinon.stub(tokenizer, "cache");
            cacheStub.get(() => {
                return data.countOccurrences.pullCache.stub();
            });
            const result = tokenizer.countOccurrences.apply(tokenizer, data.countOccurrences.pullCache.input);
            result.should.equal(data.countOccurrences.pullCache.output);
            cacheStub.restore();
        });

        it("should create new cache entries", () => {
            const result = tokenizer.countOccurrences("a word", "word");
            tokenizeStub.calledWith("a word").should.be.true;
            result.should.equal(3);
        });

        it("should gracefully ignore bad input", () => {
            let result = tokenizer.countOccurrences("haystack");
            tokenizeStub.called.should.be.false;
            result.should.equal(0);
            result = tokenizer.countOccurrences();
            tokenizeStub.called.should.be.false;
            result.should.equal(0);
            result = tokenizer.countOccurrences();
            tokenizeStub.called.should.be.false;
            result.should.equal(0);
        });

        afterEach(() => {
            tokenizeStub.restore();
        });

    });

    afterEach(() => {
        tokenizer = null;
    });
});
