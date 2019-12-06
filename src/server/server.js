import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import 'babel-polyfill';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// Flight status codes
const STATUS_CODE_UNKNOWN           =  0;
const STATUS_CODE_ON_TIME           = 10;
const STATUS_CODE_LATE_AIRLINE      = 20;
const STATUS_CODE_LATE_WEATHER      = 30;
const STATUS_CODE_LATE_TECHNICAL    = 40;
const STATUS_CODE_LATE_OTHER        = 50;
const STATUSCODES                   = [ STATUS_CODE_UNKNOWN,
                                        STATUS_CODE_ON_TIME,
                                        STATUS_CODE_LATE_AIRLINE,
                                        STATUS_CODE_LATE_WEATHER,
                                        STATUS_CODE_LATE_TECHNICAL,
                                        STATUS_CODE_LATE_OTHER
                                       ];
const statusCodeString              = [ "STATUS_CODE_UNKNOWN",
                                        "STATUS_CODE_ON_TIME",
                                        "STATUS_CODE_LATE_AIRLINE",
                                        "STATUS_CODE_LATE_WEATHER",
                                        "STATUS_CODE_LATE_TECHNICAL",
                                        "STATUS_CODE_LATE_OTHER"
                                       ];

// number of oracles
const NUM_ORACLES                    = 30;
const ORACLE_STAKE                   = web3.utils.toWei('1',   'ether');
var oracle_addrs                     = [];

// This function registereds NUM_ORACLES oracles, whom will be called on for flight status info.
var registerOracles = async function () {

    console.log("Register ", NUM_ORACLES, " oracles");
  
    var accounts = await web3.eth.getAccounts();
    var start = accounts.length-1;
    
    for (var i =0; i< NUM_ORACLES; i++)
    {
        //console.log("i ", i, " start - i ", start - i, " accounts ", accounts[start - i]);
        try
        {
            await flightSuretyApp.methods.registerOracle().send({
                                                        from : accounts[start - i],
                                                        value: ORACLE_STAKE,
                                                        gas:6600000});
                                                        //gasPrice:100000 });
            let oracleIx = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[start - i]});
            console.log(`Oracle Registered ${i}:  ${oracleIx[0]}, ${oracleIx[1]}, ${oracleIx[2]}`); 
        
        }catch(e)
        {
            console.log("register oracle error: ", e);
        }
        oracle_addrs.push(accounts[start - i]);
    
    }
    console.log("Done oracle registration.");
    /**
    for (var i = 0; i< 1; i++)
    {
        console.log(" oracle ", i, " address ", oracle_addrs[i]);
        try{
        
            let oracleIx = await flightSuretyApp.methods.getMyIndexes().call({from: oracle_addrs[i]});
            console.log(`Oracle Registered ${i}:  ${oracleIx[0]}, ${oracleIx[1]}, ${oracleIx[2]}`);
         }catch(e)
         {
            console.log("error get index ", e);
         }
    }
    console.log("done index check loop");
    **/
    
}

// Call register oracles
registerOracles();



flightSuretyApp.events.OracleRequest({
    fromBlock: 'latest'
  }, async function (error, event) {
    if (error)
    {
        console.log(error);
    }
    //console.log(event)
    let index     = event.returnValues.index;
    let airline   = event.returnValues.airline;
    let flight    = event.returnValues.flight;
    let timestamp = event.returnValues.timestamp;
    console.log("OracleRequent initiated");
    console.log("event.returnValues.index ", event.returnValues.index);
    console.log("event.returnValues.airline ", event.returnValues.airline);
    console.log("event.returnValues.flight ", event.returnValues.flight);
    console.log("event.returnValues.timestamp ", event.returnValues.timestamp);
    for (let i = 0; i< NUM_ORACLES; i++)
    //for (let i = 0; i< 1; i++)
    {
        // Generate a random index, use this index to select from STATUSCODES
        let codeIndex = Math.floor(Math.random()*STATUSCODES.length)
        let statusCode = STATUSCODES[codeIndex]; 
        //let statusCode =  STATUS_CODE_LATE_AIRLINE; //use one status code for testing
        
        try{
           let oracleIx = await flightSuretyApp.methods.getMyIndexes().call({from: oracle_addrs[i]});
           if(oracleIx.includes(index))
           {
                console.log(" ++++++++++++++++ ");
                console.log("Oracle i ", i, " index: ", index, "total number of oracles ", NUM_ORACLES);
                console.log("Oracle's indices: ", oracleIx);
                console.log("Status code submitted: ", statusCode, " string ", statusCodeString[codeIndex]);
            
           }
           let status = await flightSuretyApp.methods.submitOracleResponse(
                                                            index, 
                                                            airline, 
                                                            flight, 
                                                            timestamp, 
                                                            statusCode
                                                        ).send( {from: oracle_addrs[i], gas : 6666666}, (error, result)=>{
                                                        
                                                        
                                                        
                                                        });
                                                       
           //console.log("Oracle responses are accepted: ", status);
        }catch(e)
        {
            //console.log("error ", e);
            //console.log("error")
        }
        
    }
    
    
    
});

flightSuretyApp.events.FlightStatusInfo({
    fromBlock: 'latest'
  }, async function (error, event) {
    console.log(" ++++++++++++++++ ");
    console.log("FlightStatusInfo event triggered");
    console.log("Status code returned: ",event.returnValues.status);
    
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


