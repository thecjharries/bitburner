module.exports = {
    constructorSignature: {
        ip: "1.1.1.1",
        hostname: "box",
        organization: "test"
    },
    initialize: {
        ip: "1.1.1.1",
        hostname: "box",
        organization: "test",
        isOnline: false,
        isConnectedTo: true,
        hasAdminRights: true
    },
    update: {
        moneyAvailable: 42,
        serverGrowth: .42
    },
    scripts: {
        hack: `\
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
};`
    },
    getScript: {
        name: "hack"
    }
};
