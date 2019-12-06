import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json'; // deploy contract to ensure this file is uptodate
import Web3 from 'web3';

/**
    This JavaScript file contains functions that interact with 
    the smart contract.

**/
export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        
        this.owner = null;
        this.airlines = [];          // all airlines accounts
        
        this.passengers = [];        // all passenger accounts
        
        this.registeredAirlines =[]; 
        this.fundedAirlines     =[];
        
        /** 
        availableFlights is a dictionary, where key is airline account
        then for each airline, the value is another dictionary where 
        a key represents flight string and value is the object containing flight info
        needed to pass into the smart contract.
        
        e.g. flightSchedule ={ "0x....": { "AAA 111 @ timestamp":{  airline   : 0x..., 
                                                                    flight    : "AAA 111", 
                                                                    timestamp : timestamp
                                                                  }, 
                                           
                                           "BBB 222 @ timestamp": {... }  
                                           ...
                                          },
                                            
                                "0x...": {... next airline's flights, ...},
                                
                                ... more accounts
                             }
        **/
        this.availableFlights   = {};
        this.registeredFlights  = {};
        
        // this shows up in browser's console
        console.log("************************************");
        console.log("initialize");
        this.initialize(callback);
    }

    /**
        The function initialize(callback) initializes 5 airline and 5 passenger 
        accounts using the 1st to 11th accounts returned by web3.
        
        This function also checks if any airlines are registered or
        funded and place these airlines in their respective arrays.
        
        This function is called everytime the webpage refreshes.
        
        The 0-th account is contract owner.
    **/
    initialize(callback) {
        this.web3.eth.getAccounts(async (error, accts) => {
            
            this.owner = accts[0];
            console.log("in initialize")

            let counter = 1;
            
            while(this.airlines.length < 10) {
                
                var account = accts[counter];
                console.log("airline ", account)
                this.airlines.push(account);
                
                var isReg = await this.isAirlineRegistered(account)
                console.log("result for isAirlineReg ", isReg);
                if(isReg)
                {
                    this.registeredAirlines.push(account);
                    
                }
                
                var hasFunded = await this.hasAirlineFunded(account);
                console.log("has airline funded: ", hasFunded);
                
                if(hasFunded)
                {
                    this.fundedAirlines.push(account);
                }
                /** 
                    If airline is registered, add to registeredAirlines 
                    dictionary with empty fight list.
                **/
                
                counter = counter + 1;
                console.log("done airline while loop counter ", counter);   
            }
            this.addAvailableFlightsToAirlines();
            
            this.addRegisteredFlightsToAirlines();
            
            while(this.passengers.length < 10) {
                this.passengers.push(accts[counter++]);
                
            }
            console.log("----------------------------");
            console.log(" DONE INITIALIZE CALL CALLBACK ");
            callback();
        });
    }
    /**
        Add some available flights to airlines
        I'm using the same date for simplicity, 
        having a random date gives a different flight if the page refreshes.
        
        The flight number is changed to ensure each flight added is different.
        
    **/
    addAvailableFlightsToAirlines()
    {   
        
        
        console.log("Add Flights");
        for (var i in this.airlines)
        {
            console.log("Add flights for airline ", this.airlines[i]);
            
            // Make numFlights random flights for each airline
            var numFlights = 3;
            
            this.availableFlights[this.airlines[i]] = {};
            
            // Change flight number so every flight is different
            var flightNum   = 111;
            var addDays     = 1
            
            var flightDate = new Date("2025-04-01 12:00");//= new Date();
            var startDate = new Date("2025-12-30 12:00")
            for(var j =0; j< numFlights; j++)
            {
                
                var randFlightNum = "X"+  flightNum;
                //console.log("random num: ", randFlightNum);
                flightNum = flightNum + 1
                flightDate.setDate(startDate.getDate() + addDays);
                 
                var flightKey = randFlightNum + "@"+ flightDate;
                console.log("flightKey ", flightKey);
                
              
                console.log("flightdate ", flightDate.toString());
                this.availableFlights[this.airlines[i]][flightKey]={
                
                    airline  : this.airlines[i],
                    flight   : randFlightNum,
                    timestamp: Math.floor(flightDate/1000)
                 
                }
                
                addDays = addDays + 1;
            }
           
        }
        console.log("this.availableFlights");
        console.log(this.availableFlights);
        
    
    }
    
    /**
        This function loops through all available flights
        and asks the smart contract which one is registered.
        
        This function is used to repopulate the registered flights
        drop down when front end is refreshed.
        
    **/
    async addRegisteredFlightsToAirlines()
    {
        console.log("add registered flights");
        var keys = Object.keys(this.availableFlights);
      
        for (var i in keys)
        {
            //this.registeredFlights
            var airline = keys[i]
            console.log("airline :", airline);
            this.registeredFlights[airline] = {};
            
            var availableFlights = Object.keys(this.availableFlights[airline]);
            for (var j in availableFlights)
            {
                var flightString = availableFlights[j];
                console.log("flightString ");
                console.log(flightString);
                
                var flightObject = this.availableFlights[airline][flightString];
                
                var airline     = flightObject.airline;
                var flight      = flightObject.flight;
                var timestamp   = flightObject.timestamp;
                
                console.log("airline ", airline);
                console.log("flight ", flight);
                console.log("timestamp ", timestamp);
                
                var isReg = await this.isFlightRegistered(airline, flight, timestamp);
                console.log("isReg ", isReg);
                if(isReg)
                {
                    this.registeredFlights[airline][flightString] = flightObject; //this.availableFlights[airline][flight];
                
                }
                
            }
            
        
        }
        console.log("this.registeredFlights");
        console.log(this.registeredFlights);
        
    
    }
    
    
    isOperational(callback) 
    {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }
    isFlightRegistered(airline, flight, timestamp)
    {
        let self = this;       
           
        return self.flightSuretyData.methods
                   .isFlightRegistered(airline, flight, timestamp)
                   .call({from: self.owner});
                        
    }                           
    fetchFlightStatus(airline, flight, timestamp, callback) {
        let self = this;
        
        self.flightSuretyApp.methods
            .fetchFlightStatus(airline, flight, timestamp)
            .send({ from: self.owner}, callback);
    }
    
    // Is airline registered
    isAirlineRegistered(airline){
        let self = this;
        
       
       return self.flightSuretyData.methods
                  .isAirlineRegistered(airline)
                  .call({from:self.owner, gas: 1000000});
    
    }
    
    hasAirlineFunded(airline, callback){
        let self = this;
        
        
        return self.flightSuretyApp.methods
                   .hasAirlineFunded(airline)
                   .call({from: self.owner});
       
    }
    
    // Register airline
    registerAirline( toBeRegistered, fromAirline, callback ) {
        let self = this;
        
        self.flightSuretyApp.methods
            .registerAirline(toBeRegistered)
            //doesn't work if I leave out gas
            .send({from: fromAirline, gas: 1000000}, callback);
    
    
    }
    
    // Register flight
    registerFlight(airline, flight, timestamp, callback){
    
        let self = this;
        
        self.flightSuretyApp.methods
            .registerFlight(airline, flight, timestamp)
            .send({from: airline}, callback);
    }
    
    
    // Fund a registered airline
    fundAirline(airline, amount, callback){
        
        let self = this;
        console.log("in fund airline");
      
        //console.log(this.web3.eth.getAccounts());
        var amountEther = this.web3.utils.toWei(amount, "ether");
        self.flightSuretyData.methods
            .fund()
            .send({from: airline, value: amountEther}, callback)
      
    }
    
    // return the number of votes recieved by airline
    viewNumVotes(airline)
    {
        let self = this;
        
        return self.flightSuretyApp.methods
                   .viewNumVotes(airline).call({from: self.owner});
    
    }
    
    // view threshold for multiparty consensus
    viewMutiPartyThreshold()
    {
        let self = this;
        return self.flightSuretyApp.methods
                   .viewMultiPartyThreshold().call({from: self.owner});
    
    }
    viewRegisteredAirlinesCount()
    {
        let self = this;
        
        return self.flightSuretyData.methods
                   .viewRegisteredAirlinesCount().call({from:self.owner});
    }
    
    
    
    // Return total fund
    
    viewTotalFund(callback){
        let self = this;
        return self.flightSuretyData.methods.viewTotalFund().call({from: self.owner}, callback);
    }
    
    withdrawBenefit(airline, flight, timestamp, passenger, callback){
        let self = this;
          
        self.flightSuretyApp.methods.payInsurance
                            (
                                airline,
                                flight,
                                timestamp
                                
                            ).send({from: passenger}, callback) 
  
    }
    
    
    viewPremium(passenger, airline, flight, timestamp, callback){
        let self = this;
        
        self.flightSuretyData.methods.viewPremium
                            (
                                passenger,
                                airline,
                                flight,
                                timestamp   
                            ).call({from:self.owner}, callback);
    
    }
    viewBenefit(passenger, airline, flight, timestamp, callback){
        let self = this;
        self.flightSuretyData.methods.viewBenefit
                         (
                            passenger,
                            airline,
                            flight,
                            timestamp   
                         ).call({from: self.owner}, callback);
    
    }
    buyInsurance(airline, flight, timestamp, passenger, premium, callback){
        let self = this;
        
        console.log("in contract buyInsurance");
        console.log("airline ", airline);
        console.log("flight ", flight);
        console.log("timestamp ", timestamp);
        console.log("passenger ", passenger);
        var premiumEther = this.web3.utils.toWei(premium, "ether");
        
        
        console.log("premiumEther ", premiumEther);
        
        self.flightSuretyApp.methods.buyInsurance
                            (
                                airline,
                                flight,
                                timestamp
                            //).send({from: passenger, value: premiumEther}, callback); //doesn't work if gas is left out   
                            ).send({from: passenger, value: premiumEther, gas: 1000000 }, callback);
    }
}
