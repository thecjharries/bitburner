const path = require("path");

const SERVER_PROFILES = require(path.join(__dirname, "..", "data", "server-profiles"));

const Server = require(path.join(__dirname, "Server"));

module.exports = class Internet {
    static get INITIAL_PROFILES() {
        return SERVER_PROFILES;
    }

    constructor(serverList = []) {
        this.servers = {};
        this.serverArray = [];
        this.ipAddresses = {};
    }

    generateAddress() {
        let components = [Math.floor(Math.random() * 255) + 1];
        for (const index of [1, 2, 3]) {
            let count = 0;
            do {
                components[index] = Math.floor(Math.random() * 255) + 1;
                count++;
            } while (count < 255 && this.ipAddresses[components.join(".")]);
        }
        return components;
    }

    bootstrap() {
        for (const profile of Internet.INITIAL_PROFILES) {
            profile.ip = this.generateAddress();
            const server = new Server(profile);
            this.servers[server.hostname] = server;
            this.servers[server.ip] = server;
        }
        let tiers = [];
        for (let group = 15; group > 0; group--) {
            tiers.push(Internet.INITIAL_PROFILES.filter((element) => {
                return element.networkGroup === group;
            }));
            const previous = tiers[tiers.length - 2] || [];
            const current = tiers[tiers.length - 1];
            for (const server of previous) {
                const index = Math.floor(Math.random() * current.length);
                this.servers[server.hostname].link(this.servers[current[index].hostname]);
            }
        }
    }

    get count() {
        return this.servers.length;
    }

    getServer(serverId) {
        return this.servers[serverId] || null;
    }

};
