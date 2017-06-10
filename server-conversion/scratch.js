const fs = require("fs");
const path = require("path");
const servers = require(path.join(__dirname, "src", "servers"));

const parsed = fs.readFileSync(path.join(__dirname, "Server.txt"), "utf-8");

const regex = /var\s+NetworkGroup(\d+)\s*=\s*\[([a-z0 ,]+)\]/gi;
let results = [];
const newServers = [];
while ((results = regex.exec(parsed)) !== null) {
    const networkGroup = parseInt(results[1], 10);
    const exploded = results[2].split(", ");
    for (const name of exploded) {
        const possibleMatches = servers.filter((element) => {
            return element.variableName === name;
        });
        if (possibleMatches.length === 1) {
            const match = servers.splice(servers.indexOf(possibleMatches[0]), 1)[0];
            match.networkGroup = networkGroup;
            newServers.push(match);
        }
    }
}

const remainder = servers.pop();
if (remainder.variableName === "WorldDaemon") {
    newServers.push(remainder);
    fs.writeFileSync("servers.json", JSON.stringify(newServers), "utf-8");
}
