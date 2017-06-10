const chai = require("chai");
const sinon = require("sinon");
// eslint-disable-next-line no-unused-vars
const should = chai.should();
// chai.use(require('chai-as-promised'));

const path = require("path");

const Internet = require(path.join(__dirname, "..", "src", "Internet"));
const data = require(path.join(__dirname, "Internet.data"));

describe("Internet", () => {
    let internet;
    beforeEach(() => {
        internet = new Internet();
    });
    describe("generateAddress()", () => {
        it("should generate a well-formed IP", () => {
            const address = internet.generateAddress();
            for (const byte of address) {
                data.validateByte(byte).should.be.true;
            }
        });

        /*
        // Just kidding, this isn't a unit test. But it was fun.
        it("should be fast", () => {
            const start = new Date();
            for (let count = 0; count < 1000; count++) {
                const address = internet.generateAddress();
            }
            const end = new Date();
        });
        */
    });

    describe("bootstrap()", () => {
        it("should log stuff", () => {
            internet.bootstrap();
        });
    });

    afterEach(() => {
        internet = null;
    });
});
