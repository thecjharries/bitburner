const chai = require("chai");
const sinon = require("sinon");
// eslint-disable-next-line no-unused-vars
const should = chai.should();
// chai.use(require('chai-as-promised'));

const path = require("path");

const Server = require(path.join(__dirname, "..", "src", "Server"));
const data = require(path.join(__dirname, "Server.data"));

describe("Server", () => {
    let server;
    const steps = [...Array(10)].map(() => Math.floor(Math.random() * 15 + 1));

    beforeEach(() => {
        server = new Server(data.constructorSignature);
    });

    describe("constructor()", () => {
        it("should throw without all the necessary parameters", () => {
            (() => {
                new Server();
            }).should.throw();
            const keys = ["ip", "hostname", "organization"];
            for (const index of [0, 1, 2]) {
                let signature = {};
                signature[keys[index]] = "value";
                (() => {
                    new Server(signature);
                }).should.throw();
                for (const secondIndex of [1, 2]) {
                    signature[keys[(index + secondIndex) % 3]] = "value";
                    (() => {
                        new Server(signature);
                    }).should.throw();
                    delete signature[keys[(index + secondIndex) % 3]];
                }
            }
        });

        it("should accept a proper signature", () => {
            const initStub = sinon.stub(Server.prototype, "initialize");
            server = new Server(data.constructorSignature);
            server.ip.should.equal(data.constructorSignature.ip.join("."));
            server.hostname.should.equal(data.constructorSignature.hostname);
            server.organization.should.equal(data.constructorSignature.organization);
            initStub.calledWith(data.constructorSignature).should.be.true;
            initStub.restore();
        });
    });

    describe("initialize()", () => {
        let server;
        it("should defer to passed in config", () => {
            server = new Server(data.initialize);
            const properties = Server.DEFAULTS;
            properties.isOnline = data.initialize.isOnline;
            properties.isConnectedTo = data.initialize.isConnectedTo;
            properties.hasAdminRights = data.initialize.hasAdminRights;
            server.should.be.an("object").and.include(properties);
        });

        it("should apply defaults without a passed in config", () => {
            server.should.be.an("object").and.include(Server.DEFAULTS);
        });
    });

    describe("update()", () => {
        it("should only touch passed in items to passed in config", () => {
            server.update(data.update);
            const properties = Server.DEFAULTS;
            properties.moneyAvailable = data.update.moneyAvailable;
            properties.serverGrowth = data.update.serverGrowth;
            server.should.be.an("object").and.include(Server.DEFAULTS);
        });
    });

    describe("getScript()", () => {
        beforeEach(() => {
            server.scripts = data.scripts;
        });

        it("should return valid scripts", () => {
            server.getScript(data.getScript.name).should.equal(data.scripts[data.getScript.name]);
        });

        it("should gracefully ignore bad script names", () => {
            // https://github.com/chaijs/chai/issues/90
            should.not.exist(server.getScript());
        });
    });

    describe("fortify", () => {
        it("should increase and stop at the limit", () => {
            let value = server.hackDifficulty;
            for (const step of steps) {
                value = (value += step) > Server.RANGES.HACK_DIFFICULTY.MAX ? Server.RANGES.HACK_DIFFICULTY.MAX : value;
                server.fortify(step).should.equal(value);
            }
            server.fortify(9001).should.equal(Server.RANGES.HACK_DIFFICULTY.MAX);
        });
    });

    describe("weaken", () => {
        it("should decrease and stop at the limit", () => {
            let value = server.hackDifficulty;
            for (const step of steps) {
                value = (value -= step * .1) < Server.RANGES.HACK_DIFFICULTY.MIN ? Server.RANGES.HACK_DIFFICULTY.MIN : value;
                server.weaken(step * .1).should.equal(value);
            }
            server.weaken(9001).should.equal(Server.RANGES.HACK_DIFFICULTY.MIN);
        });
    });

    afterEach(() => {
        server = null;
    });
});
