const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer, network, accounts) {
    console.log("in deployer ")
    //console.log("deployer ", deployer);
    //console.log(" deployer.addresses ", deployer.addresses)
    console.log("number of accounts ", accounts.length)
    /**for (var a in accounts)
    {
        console.log(accounts[a]);
    
    }
    **/
    /**
        The first airline's address is passed in to the App contract and 
        this first airline is registered upon deployment.
    **/
    let firstAirline = accounts[1]; //'0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    deployer.deploy(FlightSuretyData)
    .then(() => {
        return deployer.deploy(FlightSuretyApp,FlightSuretyData.address, firstAirline)
        //return deployer.deploy(FlightSuretyApp)
                .then(() => {
                    let config = {
                        localhost: {
                            url: 'http://localhost:8545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address,
                            gas: deployer.networks[deployer.network].gas
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}
