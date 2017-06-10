const path = require("path");
const SERVER_DEFAULTS = require(path.join(__dirname, "..", "data", "server-defaults"));


// TODO: getServerOnNetwork
module.exports = class Server {
    static get DEFAULTS() {
        return SERVER_DEFAULTS;
    }

    static get PORTS() {
        return {
            SSH: 0,
            FTP: 1,
            SMTP: 2,
            HTTP: 3,
            SQL: 4
        };
    }

    constructor(config = {}) {
        if (config.ip && config.hostname && config.organization) {
            this.ip = config.ip;
            this.hostname = config.hostname;
            this.organization = config.organization;
            this.initialize(config);
        } else {
            throw new Error("Cannot create server without IP, hostname, and organization");
        }
    }

    initialize(config = {}) {
        for (let key in SERVER_DEFAULTS) {
            if (config.hasOwnProperty(key)) {
                this[key] = config[key];
            } else if (SERVER_DEFAULTS.hasOwnProperty(key)) {
                this[key] = SERVER_DEFAULTS[key];
            }
        }
    }

    update(config = {}) {
        for (const property in config) {
            if (this.hasOwnProperty(property)) {
                this[property] = config[property];
            }
        }
    }

    getScript(scriptName) {
        return this.scripts[scriptName] || null;
    }
};
