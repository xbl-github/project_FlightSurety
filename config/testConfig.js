
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts, NUM_ORACLES) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x69e1CB5cFcA8A311586e3406ed0301C06fb839a2",
        "0xF014343BDFFbED8660A9d8721deC985126f189F3",
        "0x0E79EDbD6A727CfeE09A2b1d0A59F7752d5bf7C9",
        "0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4",
        "0xa23eAEf02F9E0338EEcDa8Fdd0A73aDD781b2A86",
        "0x6b85cc8f612d5457d49775439335f83e12b8cfde",
        "0xcbd22ff1ded1423fbc24a7af2148745878800024",
        "0xc257274276a4e539741ca11b590b9447b26a8051",
        "0x2f2899d6d35b1a48a4fbdc93a37a72f264a9fca7"
    ];

    // Assign accounts

    let owner = accounts[0];
    let firstAirline    = accounts[1];
    let secondAirline   = accounts[2];
    let thirdAirline    = accounts[3];
    let fourthAirline   = accounts[4];
    let fifthAirline    = accounts[5];
    let sixthAirline    = accounts[6];
    let firstPassenger  = accounts[7];
    let secondPassenger = accounts[8];
    let thirdPassenger  = accounts[9];

    var oracles_A =[];
    
    var numAdded     = 0;
    var startIx      = 10; //accounts.length-1;
    while ( numAdded < NUM_ORACLES)
    {  
        oracles_A.push(accounts[startIx+numAdded]);
        numAdded = numAdded + 1;
    
    }
    
    
    // explicitly specify account deploying from
    let flightSuretyData = await FlightSuretyData.new({from: accounts[0]});
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address, firstAirline, {from: accounts[0]});
    
    
    return {
        owner: owner,
        firstAirline    : firstAirline,
        secondAirline   : secondAirline,
        thirdAirline    : thirdAirline,
        fourthAirline   : fourthAirline,
        fifthAirline    : fifthAirline,
        sixthAirline    : sixthAirline,
        firstPassenger  : firstPassenger,
        secondPassenger : secondPassenger,
        thirdPassenger  : thirdPassenger,
        timestampFuture : Math.floor(new Date('June 1, 2040 01:01:00')/1000),
        timestampPast   : Math.floor(new Date('June 1, 1999 01:01:00')/1000),
        premium1        : web3.utils.toWei('1',   'ether'),
        premium2        : web3.utils.toWei('0.5', 'ether'),
        premium3        : web3.utils.toWei('2', 　　'ether'),
        fundAmount      : web3.utils.toWei('10',  'ether'),
        flight1Name     : "Flight1",
        oracles         : oracles_A,
        oracleFee       : web3.utils.toWei('1',  'ether'),
        weiMultiple     : (new BigNumber(10)).pow(18),
        testAddresses   : testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp : flightSuretyApp
    }
}

module.exports = {
    Config: Config
};
