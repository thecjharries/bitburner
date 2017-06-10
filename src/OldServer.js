//Netburner Server class
//TODO Make a map of all IPS in the game so far so that we don't accidentally
//		get duplicate IPs..however unlikely it is
function Server() {
	/* Properties */
	//Connection information
    this.ip					= 	"0.0.0.0";
    this.hostname			= 	"";
    this.organizationName 	= 	"";
    this.isOnline			= 	true;
    this.isConnectedTo		= 	false;	//Whether the player is connected to this server

	//Access information
    this.hasAdminRights		=	false;	//Whether player has admin rights
    this.purchasedByPlayer	=	false;
    this.manuallyHacked     =   false;  //Flag that tracks whether or not the server has been hacked at least once

	//RAM, CPU speed and Scripts
    this.maxRam			=	1;  //GB
    this.ramUsed		=	0;
    this.cpuSpeed		= 	1;	//MHz

    this.scripts 		= 	{};
    this.runningScripts = 	[]; 	//Names (and only names) of scripts being run
    this.programs 		= 	[];
    this.messages       =   [];

	/* Hacking information (only valid for "foreign" aka non-purchased servers) */

	//Skill required to attempt a hack. Whether a hack is successful will be determined
	//by a separate formula
    this.requiredHackingSkill	= 1;

	//Total money available on this server
    this.moneyAvailable 		= 0;
    this.moneyMax               = 0;

	//Parameters used in formulas that dictate how moneyAvailable and requiredHackingSkill change.
    this.hackDifficulty			= 1;	//Affects hack success rate and how the requiredHackingSkill increases over time (1-100)
    this.baseDifficulty         = 1;    //Starting difficulty
    this.minDifficulty          = 1;
    this.serverGrowth			= 0;	//Affects how the moneyAvailable increases (0-100)
    this.timesHacked 			= 0;

	//The IP's of all servers reachable from this one (what shows up if you run scan/netstat)
    //  NOTE: Only contains IP and not the Server objects themselves
    this.serversOnNetwork		= [];

	//Port information, required for porthacking servers to get admin rights
    this.numOpenPortsRequired 	= 5;
    this.sshPortOpen 			= false;	//Port 22
    this.ftpPortOpen 			= false;	//Port 21
    this.smtpPortOpen 			= false;	//Port 25
    this.httpPortOpen			= false;	//Port 80
    this.sqlPortOpen 			= false; 	//Port 1433
    this.openPortCount 			= 0;
}

//Initialize the properties of a server
Server.prototype.init = function(
    ip,
    hostname,
    organizationName,
    onlineStatus,
    isConnectedTo,
    adminRights,
     purchasedByPlayer,
     maxRam
     ) {
    this.ip = ip;

    //Check if hostname is unique
    var i = 0;
    while (GetServerByHostname(hostname) != null) {
        //Server already exists
        hostname = hostname + "-" + i;
        ++i;
    }
    this.hostname = hostname;
    this.organizationName = organizationName;
    this.isOnline = onlineStatus;
    this.isConnectedTo = isConnectedTo;
    this.hasAdminRights = adminRights;
    this.purchasedByPlayer = purchasedByPlayer;
    this.maxRam = maxRam;
};

//Set the hacking properties of a server
Server.prototype.setHackingParameters = function(
    requiredHackingSkill,
    moneyAvailable,
    hackDifficulty,
    serverGrowth) {
    this.requiredHackingSkill = requiredHackingSkill;
    this.moneyAvailable = moneyAvailable;
    this.moneyMax = 50 * moneyAvailable;
    this.hackDifficulty = hackDifficulty;
    this.baseDifficulty = hackDifficulty;
    this.minDifficulty = Math.max(1, hackDifficulty - 25);
    this.serverGrowth = serverGrowth;
};

//Set the port properties of a server
//Right now its only the number of open ports needed to PortHack the server.
Server.prototype.setPortProperties = function(numOpenPortsReq) {
    this.numOpenPortsRequired = numOpenPortsReq;
};

//The serverOnNetwork array holds the IP of all the servers. This function
//returns the actual Server objects
Server.prototype.getServerOnNetwork = function(i) {
    if (i > this.serversOnNetwork.length) {
        console.log("Tried to get server on network that was out of range");
        return;
    }
    return AllServers[this.serversOnNetwork[i]];
};

//Given the name of the script, returns the corresponding
//script object on the server (if it exists)
Server.prototype.getScript = function(scriptName) {
    return this.scripts[scriptName] || null;
};

//Strengthens a server's security level (difficulty) by the specified amount
Server.prototype.fortify = function(amt) {
    this.hackDifficulty += amt;
    if (this.hackDifficulty > 99) {this.hackDifficulty = 99;}
};

Server.prototype.weaken = function(amt) {
    this.hackDifficulty -= amt;
    if (this.hackDifficulty < 1) {this.hackDifficulty = 1;}
};

//Functions for loading and saving a Server
Server.prototype.toJSON = function() {
    return Generic_toJSON("Server", this);
};

Server.fromJSON = function(value) {
    return Generic_fromJSON(Server, value.data);
};

Reviver.constructors.Server = Server;

initForeignServers = function() {
    //MegaCorporations
    var ECorpServer = new Server();
    ECorpServer.init(createRandomIp(), "ecorp", "ECorp", true, false, false, false, 0);
    ECorpServer.setHackingParameters(900, 100000000000, 99, 99);
    ECorpServer.setPortProperties(5);
    AddToAllServers(ECorpServer);

    var MegaCorpServer = new Server();
    MegaCorpServer.init(createRandomIp(), "megacorp", "MegaCorp", true, false, false, false, 0);
    MegaCorpServer.setHackingParameters(900, 80000000000, 99, 99);
    MegaCorpServer.setPortProperties(5);
    AddToAllServers(MegaCorpServer);

    var BachmanAndAssociatesServer = new Server();
    BachmanAndAssociatesServer.init(createRandomIp(), "b-and-a", "Bachman & Associates", true, false, false, false, 0);
    BachmanAndAssociatesServer.setHackingParameters(900, 32000000000, 80, 70);
    BachmanAndAssociatesServer.setPortProperties(5);
    AddToAllServers(BachmanAndAssociatesServer);

    var BladeIndustriesServer = new Server();
    BladeIndustriesServer.init(createRandomIp(), "blade", "Blade Industries", true, false, false, false, 0);
    BladeIndustriesServer.setHackingParameters(900, 20000000000, 90, 65);
    BladeIndustriesServer.setPortProperties(5);
    AddToAllServers(BladeIndustriesServer);

    var NWOServer = new Server();
    NWOServer.init(createRandomIp(), "nwo", "New World Order", true, false, false, false, 0);
    NWOServer.setHackingParameters(900, 40000000000, 99, 80);
    NWOServer.setPortProperties(5);
    AddToAllServers(NWOServer);

    var ClarkeIncorporatedServer = new Server();
    ClarkeIncorporatedServer.init(createRandomIp(), "clarkeinc", "Clarke Incorporated", true, false, false, false, 0);
    ClarkeIncorporatedServer.setHackingParameters(900, 15000000000, 50, 60);
    ClarkeIncorporatedServer.setPortProperties(5);
    AddToAllServers(ClarkeIncorporatedServer);

    var OmniTekIncorporatedServer = new Server();
    OmniTekIncorporatedServer.init(createRandomIp(), "omnitek", "OmniTek Incorporated", true, false, false, false, 0);
    OmniTekIncorporatedServer.setHackingParameters(900, 50000000000, 95, 99);
    OmniTekIncorporatedServer.setPortProperties(5);
    AddToAllServers(OmniTekIncorporatedServer);

    var FourSigmaServer = new Server();
    FourSigmaServer.init(createRandomIp(), "4sigma", "FourSigma", true, false, false, false, 0);
    FourSigmaServer.setHackingParameters(900, 25000000000, 60, 80);
    FourSigmaServer.setPortProperties(5);
    AddToAllServers(FourSigmaServer);

    var KuaiGongInternationalServer = new Server();
    KuaiGongInternationalServer.init(createRandomIp(), "kuai-gong", "KuaiGong International", true, false, false, false, 0);
    KuaiGongInternationalServer.setHackingParameters(925, 75000000000, 99, 99);
    KuaiGongInternationalServer.setPortProperties(5);
    AddToAllServers(KuaiGongInternationalServer);

    //Technology and communications companies (large targets)
    var FulcrumTechnologiesServer = new Server();
    FulcrumTechnologiesServer.init(createRandomIp(), "fulcrumtech", "Fulcrum Technologies", true, false, false, false, 64);
    FulcrumTechnologiesServer.setHackingParameters(900, 2000000000, 90, 85);
    FulcrumTechnologiesServer.setPortProperties(5);
    AddToAllServers(FulcrumTechnologiesServer);

    var FulcrumSecretTechnologiesServer = new Server();
    FulcrumSecretTechnologiesServer.init(createRandomIp(), "fulcrumassets", "Fulcrum Technologies Assets", true, false, false, false, 0);
    FulcrumSecretTechnologiesServer.setHackingParameters(999, 1000000, 99, 1);
    FulcrumSecretTechnologiesServer.setPortProperties(5);
    AddToAllServers(FulcrumSecretTechnologiesServer);
    SpecialServerIps.addIp(SpecialServerNames.FulcrumSecretTechnologies, FulcrumSecretTechnologiesServer.ip);

    var StormTechnologiesServer = new Server();
    StormTechnologiesServer.init(createRandomIp(), "stormtech", "Storm Technologies", true, false, false, false, 0);
    StormTechnologiesServer.setHackingParameters(850, 1500000000, 85, 80);
    StormTechnologiesServer.setPortProperties(5);
    AddToAllServers(StormTechnologiesServer);

    var DefCommServer = new Server();
    DefCommServer.init(createRandomIp(), "defcomm", "DefComm", true, false, false, false, 0);
    DefCommServer.setHackingParameters(825, 900000000, 90, 60);
    DefCommServer.setPortProperties(5);
    AddToAllServers(DefCommServer);

    var InfoCommServer = new Server();
    InfoCommServer.init(createRandomIp(), "infocomm", "InfoComm", true, false, false, false, 0);
    InfoCommServer.setHackingParameters(830, 750000000, 80, 50);
    InfoCommServer.setPortProperties(5);
    AddToAllServers(InfoCommServer);

    var HeliosLabsServer = new Server();
    HeliosLabsServer.init(createRandomIp(), "helios", "Helios Labs", true, false, false, false, 0);
    HeliosLabsServer.setHackingParameters(800, 500000000, 90, 75);
    HeliosLabsServer.setPortProperties(5);
    AddToAllServers(HeliosLabsServer);

    var VitaLifeServer = new Server();
    VitaLifeServer.init(createRandomIp(), "vitalife", "VitaLife", true, false, false, false, 32);
    VitaLifeServer.setHackingParameters(775, 800000000, 85, 70);
    VitaLifeServer.setPortProperties(5);
    AddToAllServers(VitaLifeServer);

    var IcarusMicrosystemsServer = new Server();
    IcarusMicrosystemsServer.init(createRandomIp(), "icarus", "Icarus Microsystems", true, false, false, false, 0);
    IcarusMicrosystemsServer.setHackingParameters(810, 1100000000, 90, 90);
    IcarusMicrosystemsServer.setPortProperties(5);
    AddToAllServers(IcarusMicrosystemsServer);

    var UniversalEnergyServer = new Server();
    UniversalEnergyServer.init(createRandomIp(), "univ-energy", "Universal Energy", true, false, false, false, 32);
    UniversalEnergyServer.setHackingParameters(790, 1500000000, 85, 85);
    UniversalEnergyServer.setPortProperties(4);
    AddToAllServers(UniversalEnergyServer);

    var TitanLabsServer = new Server();
    TitanLabsServer.init(createRandomIp(), "titan-labs", "Titan Laboratories", true, false, false, false, 32);
    TitanLabsServer.setHackingParameters(795, 1000000000, 75, 70);
    TitanLabsServer.setPortProperties(5);
    AddToAllServers(TitanLabsServer);

    var MicrodyneTechnologiesServer = new Server();
    MicrodyneTechnologiesServer.init(createRandomIp(), "microdyne", "Microdyne Technologies", true, false, false, false, 16);
    MicrodyneTechnologiesServer.setHackingParameters(800, 900000000, 70, 80);
    MicrodyneTechnologiesServer.setPortProperties(5);
    AddToAllServers(MicrodyneTechnologiesServer);

    var TaiYangDigitalServer = new Server();
    TaiYangDigitalServer.init(createRandomIp(), "taiyang-digital", "Taiyang Digital", true, false, false, false, 0);
    TaiYangDigitalServer.setHackingParameters(850, 1100000000, 75, 75);
    TaiYangDigitalServer.setPortProperties(5);
    AddToAllServers(TaiYangDigitalServer);

    var GalacticCyberSystemsServer = new Server();
    GalacticCyberSystemsServer.init(createRandomIp(), "galactic-cyber", "Galactic Cybersystems", true, false, false, false, 0);
    GalacticCyberSystemsServer.setHackingParameters(825, 500000000, 60, 80);
    GalacticCyberSystemsServer.setPortProperties(5);
    AddToAllServers(GalacticCyberSystemsServer);

    //Defense Companies ("Large" Companies)
    var AeroCorpServer = new Server();
    AeroCorpServer.init(createRandomIp(), "aerocorp", "AeroCorp", true, false, false, false, 0);
    AeroCorpServer.setHackingParameters(850, 1500000000, 85, 60);
    AeroCorpServer.setPortProperties(5);
    AddToAllServers(AeroCorpServer);

    var OmniaCybersystemsServer = new Server();
    OmniaCybersystemsServer.init(createRandomIp(), "omnia", "Omnia Cybersystems", true, false, false, false, 0);
    OmniaCybersystemsServer.setHackingParameters(825, 1200000000, 90, 65);
    OmniaCybersystemsServer.setPortProperties(5);
    AddToAllServers(OmniaCybersystemsServer);

    var ZBDefenseServer = new Server();
    ZBDefenseServer.init(createRandomIp(), "zb-def", "ZB Defense Industries", true, false, false, false, 0);
    ZBDefenseServer.setHackingParameters(800, 1000000000, 60, 70);
    ZBDefenseServer.setPortProperties(4);
    AddToAllServers(ZBDefenseServer);

    var AppliedEnergeticsServer = new Server();
    AppliedEnergeticsServer.init(createRandomIp(), "applied-energetics", "Applied Energetics", true, false, false, false, 0);
    AppliedEnergeticsServer.setHackingParameters(775, 1200000000, 70, 72);
    AppliedEnergeticsServer.setPortProperties(4);
    AddToAllServers(AppliedEnergeticsServer);

    var SolarisSpaceSystemsServer = new Server();
    SolarisSpaceSystemsServer.init(createRandomIp(), "solaris", "Solaris Space Systems", true, false, false, false, 0);
    SolarisSpaceSystemsServer.setHackingParameters(800, 900000000, 75, 75);
    SolarisSpaceSystemsServer.setPortProperties(5);
    AddToAllServers(SolarisSpaceSystemsServer);

    var DeltaOneServer = new Server();
    DeltaOneServer.init(createRandomIp(), "deltaone", "Delta One", true, false, false, false, 0);
    DeltaOneServer.setHackingParameters(810, 1500000000, 80, 60);
    DeltaOneServer.setPortProperties(5);
    AddToAllServers(DeltaOneServer);

    //Health, medicine, pharmaceutical companies ("Large" targets)
    var GlobalPharmaceuticalsServer = new Server();
    GlobalPharmaceuticalsServer.init(createRandomIp(), "global-pharm", "Global Pharmaceuticals", true, false, false, false, 16);
    GlobalPharmaceuticalsServer.setHackingParameters(775, 2000000000, 80, 85);
    GlobalPharmaceuticalsServer.setPortProperties(4);
    AddToAllServers(GlobalPharmaceuticalsServer);

    var NovaMedicalServer = new Server();
    NovaMedicalServer.init(createRandomIp(), "nova-med", "Nova Medical", true, false, false, false, 0);
    NovaMedicalServer.setHackingParameters(800, 1500000000, 70, 75);
    NovaMedicalServer.setPortProperties(4);
    AddToAllServers(NovaMedicalServer);

    var ZeusMedicalServer = new Server();
    ZeusMedicalServer.init(createRandomIp(), "zeud-med", "Zeus Medical", true, false, false, false, 0);
    ZeusMedicalServer.setHackingParameters(810, 1750000000, 80, 75);
    ZeusMedicalServer.setPortProperties(5);
    AddToAllServers(ZeusMedicalServer);

    var UnitaLifeGroupServer = new Server();
    UnitaLifeGroupServer.init(createRandomIp(), "unitalife", "UnitaLife Group", true, false, false, false, 32);
    UnitaLifeGroupServer.setHackingParameters(790, 1400000000, 75, 75);
    UnitaLifeGroupServer.setPortProperties(4);
    AddToAllServers(UnitaLifeGroupServer);

    //"Medium level" targets
    var LexoCorpServer = new Server();
    LexoCorpServer.init(createRandomIp(), "lexo-corp", "Lexo Corporation", true, false, false, false, 16);
    LexoCorpServer.setHackingParameters(700, 1000000000, 70, 60);
    LexoCorpServer.setPortProperties(4);
    AddToAllServers(LexoCorpServer);

    var RhoConstructionServer = new Server();
    RhoConstructionServer.init(createRandomIp(), "rho-construction", "Rho Construction", true, false, false, false, 0);
    RhoConstructionServer.setHackingParameters(500, 750000000, 50, 50);
    RhoConstructionServer.setPortProperties(3);
    AddToAllServers(RhoConstructionServer);

    var AlphaEnterprisesServer = new Server();
    AlphaEnterprisesServer.init(createRandomIp(), "alpha-ent", "Alpha Enterprises", true, false, false, false, 0);
    AlphaEnterprisesServer.setHackingParameters(550, 800000000, 60, 55);
    AlphaEnterprisesServer.setPortProperties(4);
    AddToAllServers(AlphaEnterprisesServer);


    var AevumPoliceServer = new Server();
    AevumPoliceServer.init(createRandomIp(), "aevum-police", "Aevum Police Network", true, false, false, false, 0);
    AevumPoliceServer.setHackingParameters(425, 100000000, 75, 40);
    AevumPoliceServer.setPortProperties(4);
    AddToAllServers(AevumPoliceServer);

    var RothmanUniversityServer = new Server();
    RothmanUniversityServer.init(createRandomIp(), "rothman-uni", "Rothman University Network", true, false, false, false, 4);
    RothmanUniversityServer.setHackingParameters(400, 250000000, 50, 40);
    RothmanUniversityServer.setPortProperties(3);
    AddToAllServers(RothmanUniversityServer);

    var ZBInstituteOfTechnologyServer = new Server();
    ZBInstituteOfTechnologyServer.init(createRandomIp(), "zb-institute", "ZB Institute of Technology Network", true, false, false, false, 4);
    ZBInstituteOfTechnologyServer.setHackingParameters(750, 1000000000, 75, 80);
    ZBInstituteOfTechnologyServer.setPortProperties(5);
    AddToAllServers(ZBInstituteOfTechnologyServer);

    var SummitUniversityServer = new Server();
    SummitUniversityServer.init(createRandomIp(), "summit-uni", "Summit University Network", true, false, false, false, 4);
    SummitUniversityServer.setHackingParameters(450, 200000000, 55, 50);
    SummitUniversityServer.setPortProperties(3);
    AddToAllServers(SummitUniversityServer);

    var SysCoreSecuritiesServer = new Server();
    SysCoreSecuritiesServer.init(createRandomIp(), "syscore", "SysCore Securities", true, false, false, false, 0);
    SysCoreSecuritiesServer.setHackingParameters(600, 600000000, 70, 65);
    SysCoreSecuritiesServer.setPortProperties(4);
    AddToAllServers(SysCoreSecuritiesServer);

    var CatalystVenturesServer = new Server();
    CatalystVenturesServer.init(createRandomIp(), "catalyst", "Catalyst Ventures", true, false, false, false, 0);
    CatalystVenturesServer.setHackingParameters(425, 900000000, 65, 40);
    CatalystVenturesServer.setPortProperties(3);
    AddToAllServers(CatalystVenturesServer);

    var TheHubServer = new Server();
    TheHubServer.init(createRandomIp(), "the-hub", "The Hub", true, false, false, false, 0);
    TheHubServer.setHackingParameters(300, 250000000, 40, 50);
    TheHubServer.setPortProperties(2);
    AddToAllServers(TheHubServer);

    var CompuTekServer = new Server();
    CompuTekServer.init(createRandomIp(), "comptek", "CompuTek", true, false, false, false, 8);
    CompuTekServer.setHackingParameters(350, 300000000, 60, 55);
    CompuTekServer.setPortProperties(3);
    AddToAllServers(CompuTekServer);

    var NetLinkTechnologiesServer = new Server();
    NetLinkTechnologiesServer.init(createRandomIp(), "netlink", "NetLink Technologies", true, false, false, false, 0);
    NetLinkTechnologiesServer.setHackingParameters(400, 350000000, 70, 60);
    NetLinkTechnologiesServer.setPortProperties(3);
    AddToAllServers(NetLinkTechnologiesServer);

    var JohnsonOrthopedicsServer = new Server();
    JohnsonOrthopedicsServer.init(createRandomIp(), "johnson-ortho", "Johnson Orthopedics", true, false, false, false, 4);
    JohnsonOrthopedicsServer.setHackingParameters(275, 100000000, 50, 50);
    JohnsonOrthopedicsServer.setPortProperties(2);
    AddToAllServers(JohnsonOrthopedicsServer);

    //"Low level" targets
    var FoodNStuffServer = new Server();
    FoodNStuffServer.init(createRandomIp(), "foodnstuff", "Food N Stuff Supermarket", true, false, false, false, 4);
    FoodNStuffServer.setHackingParameters(1, 1000000, 10, 5);
    FoodNStuffServer.setPortProperties(0);
    AddToAllServers(FoodNStuffServer);

    var SigmaCosmeticsServer = new Server();
    SigmaCosmeticsServer.init(createRandomIp(), "sigma-cosmetics", "Sigma Cosmetics", true, false, false, false, 4);
    SigmaCosmeticsServer.setHackingParameters(5, 1300000, 10, 10);
    SigmaCosmeticsServer.setPortProperties(0);
    AddToAllServers(SigmaCosmeticsServer);

    var JoesGunsServer = new Server();
    JoesGunsServer.init(createRandomIp(), "joesguns", "Joe's Guns", true, false, false, false, 4);
    JoesGunsServer.setHackingParameters(10, 1750000, 20, 20);
    JoesGunsServer.setPortProperties(0);
    AddToAllServers(JoesGunsServer);

    var Zer0NightclubServer = new Server();
    Zer0NightclubServer.init(createRandomIp(), "zer0", "ZER0 Nightclub", true, false, false, false, 4);
    Zer0NightclubServer.setHackingParameters(75, 7500000, 25, 40);
    Zer0NightclubServer.setPortProperties(1);
    AddToAllServers(Zer0NightclubServer);

    var NectarNightclubServer = new Server();
    NectarNightclubServer.init(createRandomIp(), "nectar-net", "Nectar Nightclub Network", true, false, false, false, 4);
    NectarNightclubServer.setHackingParameters(20, 2000000, 20, 25);
    NectarNightclubServer.setPortProperties(0);
    AddToAllServers(NectarNightclubServer);

    var NeoNightclubServer = new Server();
    NeoNightclubServer.init(createRandomIp(), "neo-net", "Neo Nightclub Network", true, false, false, false, 4);
    NeoNightclubServer.setHackingParameters(50, 4500000, 25, 25);
    NeoNightclubServer.setPortProperties(1);
    AddToAllServers(NeoNightclubServer);

    var SilverHelixServer = new Server();
    SilverHelixServer.init(createRandomIp(), "silver-helix", "Silver Helix", true, false, false, false, 2);
    SilverHelixServer.setHackingParameters(150, 55000000, 30, 30);
    SilverHelixServer.setPortProperties(2);
    AddToAllServers(SilverHelixServer);

    var HongFangTeaHouseServer = new Server();
    HongFangTeaHouseServer.init(createRandomIp(), "hong-fang-tea", "HongFang Teahouse", true, false, false, false, 4);
    HongFangTeaHouseServer.setHackingParameters(30, 2500000, 15, 15);
    HongFangTeaHouseServer.setPortProperties(0);
    AddToAllServers(HongFangTeaHouseServer);

    var HaraKiriSushiBarServer = new Server();
    HaraKiriSushiBarServer.setHackingParameters(40, 3500000, 15, 40);
    HaraKiriSushiBarServer.init(createRandomIp(), "harakiri-sushi", "HaraKiri Sushi Bar Network", true, false, false, false, 4);
    HaraKiriSushiBarServer.setPortProperties(0);
    AddToAllServers(HaraKiriSushiBarServer);

    var PhantasyServer = new Server();
    PhantasyServer.init(createRandomIp(), "phantasy", "Phantasy Club", true, false, false, false, 0);
    PhantasyServer.setHackingParameters(100, 27500000, 20, 35);
    PhantasyServer.setPortProperties(2);
    AddToAllServers(PhantasyServer);

    var MaxHardwareServer = new Server();
    MaxHardwareServer.init(createRandomIp(), "max-hardware", "Max Hardware Store", true, false, false, false, 4);
    MaxHardwareServer.setHackingParameters(80, 11000000, 15, 25);
    MaxHardwareServer.setPortProperties(1);
    AddToAllServers(MaxHardwareServer);

    var OmegaSoftwareServer = new Server();
    OmegaSoftwareServer.init(createRandomIp(), "omega-net", "Omega Software", true, false, false, false, 8);
    OmegaSoftwareServer.setHackingParameters(200, 85000000, 30, 35);
    OmegaSoftwareServer.setPortProperties(2);
    AddToAllServers(OmegaSoftwareServer);

    //Gyms
    var CrushFitnessGymServer = new Server();
    CrushFitnessGymServer.init(createRandomIp(), "crush-fitness", "Crush Fitness", true, false, false, false, 0);
    CrushFitnessGymServer.setHackingParameters(250, 40000000, 40, 30);
    CrushFitnessGymServer.setPortProperties(2);
    AddToAllServers(CrushFitnessGymServer);

    var IronGymServer = new Server();
    IronGymServer.init(createRandomIp(), "iron-gym", "Iron Gym Network", true, false, false, false, 4);
    IronGymServer.setHackingParameters(100, 20000000, 30, 20);
    IronGymServer.setPortProperties(1);
    AddToAllServers(IronGymServer);

    var MilleniumFitnessGymServer = new Server();
    MilleniumFitnessGymServer.init(createRandomIp(), "millenium-fitness", "Millenium Fitness Network", true, false, false, false, 0);
    MilleniumFitnessGymServer.setHackingParameters(500, 100000000, 50, 35);
    MilleniumFitnessGymServer.setPortProperties(3);
    AddToAllServers(MilleniumFitnessGymServer);

    var PowerhouseGymServer = new Server();
    PowerhouseGymServer.init(createRandomIp(), "powerhouse-fitness", "Powerhouse Fitness", true, false, false, false, 0);
    PowerhouseGymServer.setHackingParameters(1000, 300000000, 60, 55);
    PowerhouseGymServer.setPortProperties(5);
    AddToAllServers(PowerhouseGymServer);

    var SnapFitnessGymServer = new Server();
    SnapFitnessGymServer.init(createRandomIp(), "snap-fitness", "Snap Fitness", true, false, false, false, 0);
    SnapFitnessGymServer.setHackingParameters(750, 150000000, 50, 50);
    SnapFitnessGymServer.setPortProperties(4);
    AddToAllServers(SnapFitnessGymServer);

	//Faction servers, cannot hack money from these
    var BitRunnersServer = new Server();
    BitRunnersServer.init(createRandomIp(), "run4theh111z", "The Runners", true, false, false, false,  0);
    BitRunnersServer.setHackingParameters(getRandomInt(505, 550), 0, 0, 0);
    BitRunnersServer.setPortProperties(4);
    AddToAllServers(BitRunnersServer);
    SpecialServerIps.addIp(SpecialServerNames.BitRunnersServer, BitRunnersServer.ip);

    var TheBlackHandServer = new Server();
    TheBlackHandServer.init(createRandomIp(), "I.I.I.I", "I.I.I.I", true, false, false, false, false, 0);
    TheBlackHandServer.setHackingParameters(getRandomInt(303, 325), 0, 0, 0);
    TheBlackHandServer.setPortProperties(3);
    AddToAllServers(TheBlackHandServer);
    SpecialServerIps.addIp(SpecialServerNames.TheBlackHandServer, TheBlackHandServer.ip);

    var NiteSecServer = new Server();
    NiteSecServer.init(createRandomIp(), "avmnite-02h", "NiteSec", true, false, false, false, 0);
    NiteSecServer.setHackingParameters(getRandomInt(202, 220), 0, 0, 0);
    NiteSecServer.setPortProperties(2);
    AddToAllServers(NiteSecServer);
    SpecialServerIps.addIp(SpecialServerNames.NiteSecServer, NiteSecServer.ip);

    var DarkArmyServer = new Server();
    DarkArmyServer.init(createRandomIp(), ".", ".", true, false, false, false, 0);
    DarkArmyServer.setHackingParameters(getRandomInt(505, 550), 0, 0, 0);
    DarkArmyServer.setPortProperties(4);
    AddToAllServers(DarkArmyServer);
    SpecialServerIps.addIp(SpecialServerNames.TheDarkArmyServer, DarkArmyServer.ip);

    var CyberSecServer = new Server();
    CyberSecServer.init(createRandomIp(), "CSEC", "CyberSec", true, false, false, false, 0);
    CyberSecServer.setHackingParameters(getRandomInt(51, 60), 0, 0, 0);
    CyberSecServer.setPortProperties(1);
    AddToAllServers(CyberSecServer);
    SpecialServerIps.addIp(SpecialServerNames.CyberSecServer, CyberSecServer.ip);

    var DaedalusServer = new Server();
    DaedalusServer.init(createRandomIp(), "Icarus", "Icarus", true, false, false, false, 0);
    DaedalusServer.setHackingParameters(925, 0, 0, 0);
    DaedalusServer.setPortProperties(5);
    AddToAllServers(DaedalusServer);
    SpecialServerIps.addIp(SpecialServerNames.DaedalusServer, DaedalusServer.ip);

    //Super special Servers
    var WorldDaemon = new Server();
    WorldDaemon.init(createRandomIp(), SpecialServerNames.WorldDaemon, SpecialServerNames.WorldDaemon, true, false, false, false, 0);
    WorldDaemon.setHackingParameters(950, 0, 0, 0);
    WorldDaemon.setPortProperties(5);
    AddToAllServers(WorldDaemon);
    SpecialServerIps.addIp(SpecialServerNames.WorldDaemon, WorldDaemon.ip);


    /* Create a randomized network for all the foreign servers */
    //Groupings for creating a randomized network
    var NetworkGroup1 =     [IronGymServer, FoodNStuffServer, SigmaCosmeticsServer, JoesGunsServer, HongFangTeaHouseServer, HaraKiriSushiBarServer];
    var NetworkGroup2 =     [MaxHardwareServer, NectarNightclubServer, Zer0NightclubServer, CyberSecServer];
    var NetworkGroup3 =     [OmegaSoftwareServer, PhantasyServer, SilverHelixServer, NeoNightclubServer];
    var NetworkGroup4 =     [CrushFitnessGymServer, NetLinkTechnologiesServer, CompuTekServer, TheHubServer, JohnsonOrthopedicsServer, NiteSecServer];
    var NetworkGroup5 =     [CatalystVenturesServer, SysCoreSecuritiesServer, SummitUniversityServer, ZBInstituteOfTechnologyServer, RothmanUniversityServer, TheBlackHandServer];
    var NetworkGroup6 =     [LexoCorpServer, RhoConstructionServer, AlphaEnterprisesServer, AevumPoliceServer, MilleniumFitnessGymServer];
    var NetworkGroup7 =     [GlobalPharmaceuticalsServer, AeroCorpServer, GalacticCyberSystemsServer, SnapFitnessGymServer];
    var NetworkGroup8 =     [DeltaOneServer, UnitaLifeGroupServer, OmniaCybersystemsServer];
    var NetworkGroup9 =     [ZeusMedicalServer, SolarisSpaceSystemsServer, UniversalEnergyServer, IcarusMicrosystemsServer, DefCommServer];
    var NetworkGroup10 =    [NovaMedicalServer, ZBDefenseServer, TaiYangDigitalServer, InfoCommServer];
    var NetworkGroup11 =    [AppliedEnergeticsServer, MicrodyneTechnologiesServer, TitanLabsServer, BitRunnersServer];
    var NetworkGroup12 =    [VitaLifeServer, HeliosLabsServer, StormTechnologiesServer, FulcrumTechnologiesServer];
    var NetworkGroup13 =    [KuaiGongInternationalServer, FourSigmaServer, OmniTekIncorporatedServer, DarkArmyServer];
    var NetworkGroup14 =    [PowerhouseGymServer, ClarkeIncorporatedServer, NWOServer, BladeIndustriesServer, BachmanAndAssociatesServer];
    var NetworkGroup15 =    [FulcrumSecretTechnologiesServer, MegaCorpServer, ECorpServer, DaedalusServer];

    for (var i = 0; i < NetworkGroup2.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup1[Math.floor(Math.random() * NetworkGroup1.length)];
        NetworkGroup2[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup2[i].ip);
    }

    for (var i = 0; i < NetworkGroup3.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup2[Math.floor(Math.random() * NetworkGroup2.length)];
        NetworkGroup3[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup3[i].ip);
    }

    for (var i = 0; i < NetworkGroup4.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup3[Math.floor(Math.random() * NetworkGroup3.length)];
        NetworkGroup4[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup4[i].ip);
    }

    for (var i = 0; i < NetworkGroup5.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup4[Math.floor(Math.random() * NetworkGroup4.length)];
        NetworkGroup5[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup5[i].ip);
    }

    for (var i = 0; i < NetworkGroup6.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup5[Math.floor(Math.random() * NetworkGroup5.length)];
        NetworkGroup6[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup6[i].ip);
    }

    for (var i = 0; i < NetworkGroup7.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup6[Math.floor(Math.random() * NetworkGroup6.length)];
        NetworkGroup7[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup7[i].ip);
    }

    for (var i = 0; i < NetworkGroup8.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup7[Math.floor(Math.random() * NetworkGroup7.length)];
        NetworkGroup8[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup8[i].ip);
    }

    for (var i = 0; i < NetworkGroup9.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup8[Math.floor(Math.random() * NetworkGroup8.length)];
        NetworkGroup9[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup9[i].ip);
    }

    for (var i = 0; i < NetworkGroup10.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup9[Math.floor(Math.random() * NetworkGroup9.length)];
        NetworkGroup10[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup10[i].ip);
    }

    for (var i = 0; i < NetworkGroup11.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup10[Math.floor(Math.random() * NetworkGroup10.length)];
        NetworkGroup11[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup11[i].ip);
    }

    for (var i = 0; i < NetworkGroup12.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup11[Math.floor(Math.random() * NetworkGroup11.length)];
        NetworkGroup12[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup12[i].ip);
    }

    for (var i = 0; i < NetworkGroup13.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup12[Math.floor(Math.random() * NetworkGroup12.length)];
        NetworkGroup13[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup13[i].ip);
    }

    for (var i = 0; i < NetworkGroup14.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup13[Math.floor(Math.random() * NetworkGroup13.length)];
        NetworkGroup14[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup14[i].ip);
    }

    for (var i = 0; i < NetworkGroup15.length; i++) {
        var randomServerFromPrevGroup = NetworkGroup14[Math.floor(Math.random() * NetworkGroup14.length)];
        NetworkGroup15[i].serversOnNetwork.push(randomServerFromPrevGroup.ip);
        randomServerFromPrevGroup.serversOnNetwork.push(NetworkGroup15[i].ip);
    }

    //Connect the first tier of servers to the player's home computer
    for (var i = 0; i < NetworkGroup1.length; i++) {
        Player.getHomeComputer().serversOnNetwork.push(NetworkGroup1[i].ip);
        NetworkGroup1[i].serversOnNetwork.push(Player.homeComputer);
    }
};

//Applied server growth for a single server. Returns the percentage growth
processSingleServerGrowth = function(server, numCycles) {
    //Server growth processed once every 450 game cycles
    var numServerGrowthCycles = Math.max(Math.floor(numCycles / 450), 0);

    //Get adjusted growth rate, which accounts for server security
    var growthRate = CONSTANTS.ServerBaseGrowthRate;
    var adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
    if (adjGrowthRate > CONSTANTS.ServerMaxGrowthRate) {adjGrowthRate = CONSTANTS.ServerMaxGrowthRate;}
    console.log("Adjusted growth rate: " + adjGrowthRate);

    //Calculate adjusted server growth rate based on parameters
    var serverGrowthPercentage = server.serverGrowth / 100;
    var numServerGrowthCyclesAdjusted = numServerGrowthCycles * serverGrowthPercentage;

    //Apply serverGrowth for the calculated number of growth cycles
    var serverGrowth = Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * Player.hacking_grow_mult) ;
    if (serverGrowth < 1) {
        console.log("WARN: serverGrowth calculated to be less than 1");
        serverGrowth = 1;
    }

    server.moneyAvailable *= serverGrowth;
    if (server.moneyMax && server.moneyAvailable >= server.moneyMax) {
        server.moneyAvailable = server.moneyMax;
        return 1;
    }
    server.fortify(2 * CONSTANTS.ServerFortifyAmount);
    return serverGrowth;
};

//List of all servers that exist in the game, indexed by their ip
AllServers = {};

SizeOfAllServers = function() {
    var size = 0, key;
    for (key in AllServers) {
        if (AllServers.hasOwnProperty(key)) size++;
    }
    return size;
};

//Add a server onto the map of all servers in the game
AddToAllServers = function(server) {
    var serverIp = server.ip;
    if (ipExists(serverIp)) {
        console.log("IP of server that's being added: " + serverIp);
        console.log("Hostname of the server thats being added: " + server.hostname);
        console.log("The server that already has this IP is: " + AllServers[serverIp].hostname);
        throw new Error("Error: Trying to add a server with an existing IP");
        return;
    }
    AllServers[serverIp] = server;
};

//Returns server object with corresponding hostname
//	Relatively slow, would rather not use this a lot
GetServerByHostname = function(hostname) {
    for (var ip in AllServers) {
        if (AllServers.hasOwnProperty(ip)) {
            if (AllServers[ip].hostname == hostname) {
                return AllServers[ip];
            }
        }
    }
    return null;
};

//Get server by IP or hostname. Returns null if invalid
getServer = function(s) {
    if (!isValidIPAddress(s)) {
        return GetServerByHostname(s);
    } else {
        return AllServers[s];
    }
};

//Debugging tool
PrintAllServers = function() {
    for (var ip in AllServers) {
        if (AllServers.hasOwnProperty(ip)) {
            console.log("Ip: " + ip + ", hostname: " + AllServers[ip].hostname);
        }
    }
};
