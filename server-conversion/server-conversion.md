# Refactoring `Server.js`

I tried to poke around the ends and find something useful to contribute.
## Extracting Configuration
I noticed most of the servers are built inline, rather than loading their config from a database/file. I initially started out just trying to do that.

### Sanitizing

I dumped everything into `Server.txt` and started clearing what wasn't useful. I dropped an extraneous boolean from The Black Hand and made Harakiri Sushi use the same order as the rest. I also moved the network groups to the top.

### Moving to JSON
Using regex, I did a ton of replacements.

1. Searching for
    ```javascript
    var FoodNStuffServer = new Server();
    FoodNStuffServer.init(createRandomIp(), "foodnstuff", "Food N Stuff Supermarket", true, false, false, false, 4);
    var CyberSecServer = new Server();
    CyberSecServer.init(createRandomIp(), "CSEC", "CyberSec", true, false, false, false, 0);
    ```
    using
    ```regex
    var (\w+) = new Server\(\);\s*(?1)\.init\(createRandomIp\(\),\s*("[a-z\-0-9\. \&']+"),\s*("[a-z\-0-9\. \&']+"),\s*(true|false),\s*(true|false),\s*(true|false),\s*(true|false),\s*(\d+)\);\s*
    ```
    to be replaced with
    ```regex
    {\n"variableName": "\1",\n"hostname": \2,\n"organizationName": \3,\n"onlineStatus": \4,\n"isConnectedTo": \5,\n"adminRights": \6,\n"purchasedByPlayer": \7,\n"maxRam": \8,\n
    ```
2. Searching for
    ```javascript
    FoodNStuffServer.setPortProperties(0);
    CyberSecServer.setPortProperties(1);
    ```
    using
    ```
    (?:\w+)\.setPortProperties\((\d)\);
    ```
    to be replaced with
    ```
    "openPortsRequired": \1,
    ```
3. Searching for
    ```javascript
    FoodNStuffServer.setHackingParameters(1, 1000000, 10, 5);
    ```
    using
    ```regex
    (?:\w+)\.setHackingParameters\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\);
    ```
    to be replaced with
    ```regex
    "requiredHackingSkill": \1,\n"moneyAvailable": \2,\n"hackDifficulty": \3,\n"serverGrowth": \4,
    ```
4. Searching for
    ```javascript
    CyberSecServer.setHackingParameters(getRandomInt(51, 60), 0, 0, 0);
    ```
    using
    ```regex
    \w+\.\w+\(getRandomInt\((\d+),\s*(\d+)\),\s*(\d+),\s*(\d+),\s*(\d+)\);
    ```
    to be replaced with
    ```regex
    "requiredHackingRange": [\1, \2],\n"moneyAvailable": \3,\n"hackDifficulty": \4,\n"serverGrowth": \5,
    ```
5. Searching for
    ```javascript
    AddToAllServers(FoodNStuffServer);
    AddToAllServers(CyberSecServer);
    ```
    using
    ```regex
    AddToAllServers\(\w+\);
    ```
    to be replaced with
    ```regex
    },
    ```
6. Searching for
    ```javascript
    SpecialServerIps.addIp(SpecialServerNames.CyberSecServer, CyberSecServer.ip);
    ```
    using
    ```regex
    \},\s*SpecialServerIps\.addIp\(S[^\.]*\.(\w+),\s+\w+\.ip\);
    ```
    to be replaced with
    ```regex
    "specialServer": "\1"\n},
    ```
7. Searching for comments using
    ```regex
    //.*\n
    ```
    to be replaced with
    ```regex
    \n
    ```
8. Searching for double newlines using
    ```regex
    \n\n
    ```
    to be replaced with
    ```regex
    \n
    ```

### Parsing `NetworkGroup`
Using the previously generated `txt` file, I then added the `networkGroup` via a simple node script
```javascript
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

```

## `Server` and `Internet` classes
With a new config, I tried to make sense of everything. I was able to slim down your setters through some object reuse. I also started working on splitting out some of the enumerable stuff. I got most of the way through testing `Server`.

`Internet`'s a different beast. I was trying to split out the logic at the bottom of the old `Server.js` in a reusable manner. Ideally, `Internet` would be a singleton injected into any classes that need it, because linked lists of `Server`s make everything way easier.

Save/load is a real issue. I started pulling apart my savefile, and you've got a mess of `AllServersMap` references everywhere. I understand why, though. I'd recommend figuring out a way to condense that info, like storing the values in an array inside the objects, with something in `Reviver` or `AllServersMap` that can provide context for the items, e.g.
```javascript
script.serverMap = [[0, 1, 3],...]
...
parseServerMapFromScript(map) {
    // first array is from the first server
        // first value is the moneyMap
}
```
It's nice to have a map for each property, but that also means you have to store and parse a map for each property. If you want to know the details of host `x`, you have to query every property.

## Final Thoughts
I hit a wall because I can't do pull requests on any of this without doing some major damage to your codebase, which is a rude thing for me to do. I think you're at the point where you to need to pause, figure out your goals, and find a good set of tools to use. This project is amazingly large. There's some really cool stuff here. I hope you can find something useful here, and I'm pretty interested to see where this goes.
