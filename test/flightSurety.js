var Web3Utils = require('web3-utils');
var Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const truffleAssert = require('truffle-assertions')


var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

    var config;
    
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
    
    // number of oracles
    const NUM_ORACLES                    = 30;
    
    // Index used for oracle response
    var oracleTestIndex;
    
  //beforeEach('setup contract', async () => {
  before('setup contract', async () => {
    config = await Test.Config(accounts, NUM_ORACLES);
    //console.log(accounts)
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    
    
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it('1: (multiparty) has correct initial isOperational() value', async function () {
   
    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it('2: (multiparty) can block access to setOperatingStatus() for non-Contract Owner account', async function () {
  
      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {   //let ownerData = await config.flightSuretyData.returnOwner.call()
          //console.log("ownerData is   ", ownerData);
       
          //let ownerApp = await config.flightSuretyApp.returnOwner.call()
          //console.log("ownerApp is     ", ownerApp);
          //console.log("config.owner is ", config.owner);
          
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
        //console.log("test 2 error ", e);
          accessDenied = true;
      }
      //config.testAddresses[2]config.owner
          
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it('3: (multiparty) can allow access to setOperatingStatus() for Contract Owner account', async function () {
   
      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it('4: (multiparty) can block access to functions using requireIsOperational when operating status is false', async function () {
   
      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          // attempt to register airline
          await config.flightSuretyApp.registerAirline.call(airline2, {from: config.firstAirline });
          
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });
  
  it('5: First airline is registered when contract is deployed.', async function(){
  
    // ACT
    let result = await config.flightSuretyData.isAirlineRegistered(config.firstAirline);
    //console.log("First airline ", config.firstAirline, " is registered (should be true) ", result); 
    let numReg = await config.flightSuretyData.viewRegisteredAirlinesCount({from: config.firstAirline});
    //console.log("Number of airlines registered (should be 1) ",numReg.toNumber());
    // ASSERT
    assert.equal(result, true, "First airline is not registered when contract is deployed.");
  
  
  });

 
it('6: (airline) First airline cannot register second Airline using registerAirline() if it is not funded.  This shows airline can be registered, but does not participate in contract until it submits funding of 10 ether', async () => { 
  
    // ARRANGE

    var canRegister = true;
    
    // ACT
    try {
        
        await config.flightSuretyApp.registerAirline(config.secondAirline, {from: config.firstAirline});
    }
    catch(e) {
        //console.log("test 6 error ", e);
       

    }
    
    let isSecondRegistered = await config.flightSuretyData.isAirlineRegistered(config.secondAirline); 
    //console.log('Is secondAirline registered by firstAirline ', isSecondRegistered);
    //let numReg = await config.flightSuretyData.viewRegisteredAirlinesCount({from: config.firstAirline});
    //console.log("Number of airlines registered still 1 : ", numReg.toNumber());
 
    // ASSERT
    assert.equal(isSecondRegistered, false, "Airline should not be able to register another airline if it hasn't provided funding");
    
  });


 it('7: (airline) First airline can register second airline using registerAirline() after it has funded', async () => {
 
    var acc_nonce = await web3.eth.getTransactionCount(config.firstAirline) //fix nonce error
    //console.log("account nonce ", acc_nonce);
    // ACT
    try {
            // first airline funds
            await config.flightSuretyData.fund({from:config.firstAirline, value: config.fundAmount, nonce: acc_nonce});
    
            await config.flightSuretyApp.registerAirline(config.secondAirline, {from: config.firstAirline});
    }
    catch(e) {
        //console.log("test 7 err ", e);

    }
    
    var isSecondRegistered = await config.flightSuretyData.isAirlineRegistered(config.secondAirline);
    //console.log("Can register second: ", isSecondRegistered);
    //let numReg = await config.flightSuretyData.viewRegisteredAirlinesCount({from: config.secondAirline});
    //console.log("number of registered airlines: ", numReg.toNumber());
  
    // ASSERT
    assert.equal(isSecondRegistered, true, "First airline should be able to register second airline after funding.");
  });

  it('8: Only existing airline may register a new airline until there are at least four airlines registered', async () => {
        
       
        //ACT
   
       try {
                 
                // second airline funds
                await config.flightSuretyData.fund({from:config.secondAirline, value: config.fundAmount});
                
                
                // second airline registers third airline; then third airline funds
                await config.flightSuretyApp.registerAirline(config.thirdAirline, {from: config.secondAirline});
                await config.flightSuretyData.fund({from:config.thirdAirline, value: config.fundAmount});
                
                // third airline registers fourth airline, then fourth airline funds
                await config.flightSuretyApp.registerAirline(config.fourthAirline, {from: config.thirdAirline});
                await config.flightSuretyData.fund({from:config.fourthAirline, value: config.fundAmount});
        }
        catch(e) {
            //console.log("test 7 err ", e);

        }
       
        var isThirdRegistered = await config.flightSuretyData.isAirlineRegistered(config.thirdAirline);
        assert.equal(isThirdRegistered, true, "Second airline should be able to register third airline after funding.");

        var isFourthRegistered = await config.flightSuretyData.isAirlineRegistered(config.fourthAirline);
       
        assert.equal(isFourthRegistered, true, "Third airline should be able to register fourth airline after funding.");
        
        let numReg = await config.flightSuretyData.viewRegisteredAirlinesCount({from: config.firstAirline});
        //console.log("Number of registered airlines without multiparty consensus: ", numReg.toNumber());
        assert.equal(numReg, 4, "Registering first four airlines do not require multiparty consensus.");
      
  });


  it('9. Registration of fifth by fourth airline is not sufficient, requires multi-party consensus of 50% (two) of registered airlines', async () => {

  
      //Act
      try{
            await config.flightSuretyApp.registerAirline(config.fifthAirline, {from: config.fourthAirline});
      
      }catch(e)
      {
      }
      
      
      var isFifthRegistered = await config.flightSuretyData.isAirlineRegistered(config.fifthAirline);
      
      assert.equal(isFifthRegistered, false, "Fifth airline should not be registered without multiparty consensus");
  });
  it('10. Fourth airline cannot vote twice in multi-party consensus when registering airlines', async () => {

  
  //Act
  try{
        await config.flightSuretyApp.registerAirline(config.fifthAirline, {from: config.fourthAirline});
  
  }catch(e)
  {
    //console.log("error in voting twice: ", e);
  }
  
  
  var isFifthRegistered = await config.flightSuretyData.isAirlineRegistered(config.fifthAirline);
  
  assert.equal(isFifthRegistered, false, "Fifth airline should not be registered with duplicate votes.");
  });
  
  it('11. Registration of fifth by two different airlines is sufficient, fulfills multi-party consensus of 50% (two) of registered airlines', async () => {

  
      //Act
      try{
            await config.flightSuretyApp.registerAirline(config.fifthAirline, {from: config.thirdAirline});
      
      }catch(e)
      {
      }
      
      
      var isFifthRegistered = await config.flightSuretyData.isAirlineRegistered(config.fifthAirline);
      
      assert.equal(isFifthRegistered, true, "Fifth airline should not be registered without multiparty consensus");
      
      var totalFund = await config.flightSuretyData.viewTotalFund({from: config.fifthAirline});
      //totalFund = web3.utils.fromWei(totalFund, "ether")
      //console.log("total fund ", totalFund);
  });
  
  it('12. Airline can register a flight in the future.', async() => {
   
    
    //ACT
    try
    {
         await config.flightSuretyApp.registerFlight(
                                                       config.thirdAirline, 
                                                       config.flight1Name, 
                                                       config.timestampFuture,
                                                       {from: config.secondAirline});
            
    }catch(e){}
  
    // ASSERT
    
    var isFlightRegistered = await config.flightSuretyData.isFlightRegistered(
    
                                                    config.thirdAirline, 
                                                    config.flight1Name, 
                                                    config.timestampFuture, 
                                                    {from: config.secondAirline});
                                                    
    assert.equal(isFlightRegistered, true, "Flight cannot be registered");
    
  });
  it('13. Airline cannot register a flight in the past.', async() => {
   
    
    //ACT
    try
    {
        await config.flightSuretyApp.registerFlight(
                                                     config.thirdAirline, 
                                                     config.flight1Name, 
                                                     config.timestampPast,
                                                     {from: config.secondAirline});
            
    }catch(e){}
  
    // ASSERT
    
    var isFlightRegistered = await config.flightSuretyData.isFlightRegistered(
                                                                    config.thirdAirline, 
                                                                    config.flight1Name,
                                                                    config.timestampPast, 
                                                                    {from: config.secondAirline});
    assert.equal(isFlightRegistered, false, "Flight from the past has been registered");
    
  });

  it('14. Passengers may pay up to 1 ether for purchasing flight insurance', async () => {
    
    var isFlightRegistered = await config.flightSuretyData.isFlightRegistered(config.thirdAirline, config.flight1Name, config.timestampFuture, {from: config.secondAirline});
    //console.log("isFlightRegistered: ", isFlightRegistered);

    // ARRANGE

    var canBuyInsurance = true;

    // ACT
    try
    {

        await config.flightSuretyApp.buyInsurance(
                                        config.thirdAirline, 
                                        config.flight1Name,
                                        config.timestampFuture,
                                        {from: config.firstPassenger, value: config.premium1});
        await config.flightSuretyApp.buyInsurance(
                                        config.thirdAirline, 
                                        config.flight1Name,
                                        config.timestampFuture,
                                        {from: config.secondPassenger, value: config.premium2});

    }catch(e)
    {   //console.log("test 14 error ", e);
        canBuyInsurance = false;
        
    }
    // ASSERT

    var viewPremium1 = await config.flightSuretyData.viewPremium(
                                                                    config.firstPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.firstPassenger});
    var viewPremium2 = await config.flightSuretyData.viewPremium(
                                                                    config.secondPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.secondPassenger});

    assert.equal(viewPremium1, config.premium1, "Premium paid is not the same as premium recorded.");
    assert.equal(viewPremium2, config.premium2, "Premium paid is not the same as premium recorded." );
    assert.equal(canBuyInsurance, true, "Passengers cannot purchase insurance with premium less than 1 ether.");

  });
  
    it('15. Passengers may not pay more than 1 ether for purchasing flight insurance', async () => {
    
    // ARRANGE
    
    var canBuyInsurance = true;
    
    // ACT
    try{
    
        await config.flightSuretyApp.buyInsurance(
                                        config.thirdAirline, 
                                        config.flight1Name,
                                        config.timestampFuture,
                                        {from: config.thirdPassenger, value: config.premium3});
    
    }catch(e)
    {   //console.log("test 15 error ", e);
        canBuyInsurance = false;
        
    }
    assert.equal(canBuyInsurance, false, "Passenger has purchased insurance with premium more than 1 ether, this is not allowed.");
   
  });
  
   it('16. Passengers may not pay more than once for flight insurance', async () => {
    
    var isFlightRegistered = await config.flightSuretyData.isFlightRegistered(config.thirdAirline, config.flight1Name, config.timestampFuture, {from: config.secondAirline});
    //console.log("isFlightRegistered: ", isFlightRegistered);
    
    // ARRANGE
    
    var canBuyInsurance = true;
    
    // ACT
    try{
    
        await config.flightSuretyApp.buyInsurance(
                                        config.thirdAirline, 
                                        config.flight1Name,
                                        config.timestampFuture,
                                        {from: config.firstPassenger, value: config.premium1});
    
    }catch(e)
    {   //console.log("test 14 error ", e);
        canBuyInsurance = false;
        
    }
    assert.equal(canBuyInsurance, false, "Passengers cannot purchase insurance more than once.");
   
  });
  it(`17. Register more than 20 oracles, this test uses ${NUM_ORACLES}.`, async () => {
  
    //console.log("NUM_ORACLES ",NUM_ORACLES);
    
    var oracleRegistrationError = false;
    for (var i = 0; i< config.oracles.length; i++)
    {
        try
        {
           
            //console.log("i ", i, " config.oracles[i] ", config.oracles[i]);
            
            let oracleNonce = await web3.eth.getTransactionCount(config.oracles[i]);
            //console.log("oracleNonce ", oracleNonce);
            //let flightSuretyAppNonce = await web3.eth.getTransactionCount(config.flightSuretyApp.address);
            //console.log("flightSuretyAppNonce ", flightSuretyAppNonce);
            
            await config.flightSuretyApp.registerOracle({
                                
                                from: config.oracles[i], 
                                value:config.oracleFee, 
                                nonce:oracleNonce // use oracle nonce to avoid nonce error
    
                                });
            
            
            
            let oracleIx = await config.flightSuretyApp.getMyIndexes({from: config.oracles[i]});
            // don't print every loop
            
            if(i<4 || i >  config.oracles.length - 5)
            {
                console.log("oracle i ", i, ` oracleIx  ${oracleIx[0]},  ${oracleIx[1]},  ${oracleIx[2]}`);
            }
            if (i == config.oracles.length - 6)
            {
                console.log(" ... ");
            }
            
            //console.log("oracleNonce ", oracleNonce);
            //console.log("-------------------");
        }catch(e)
        {   //console.log("i ", i , " test 17 oracle registration error ", e);
            oracleRegistrationError = true;
        }
    }
    
   // let testIx = await config.flightSuretyApp.getMyIndexes({from: config.oracles[0]});
    
    
    assert.equal(oracleRegistrationError, false, "Error while registering oracles.");  
  });

  it('18. OracleRequest event is emitted', async() => {

    let result = await config.flightSuretyApp.fetchFlightStatus(  
                                        
                                        config.thirdAirline, 
                                        config.flight1Name,
                                        config.timestampFuture,
                                        {from: config.owner});
    

    truffleAssert.eventEmitted(result, 'OracleRequest', async (event) => {
        //console.log("test 18: OracleRequest event emitted from fetchFlightStatus ");
        //console.log("event.index     ", event.index.toNumber());
        //console.log("event.airline   ", event.airline);
        //console.log("event.flight    ", event.flight);
        //console.log("event.timestamp ", event.timestamp.toNumber());
        
        // Assign test index
        oracleTestIndex = event.index.toNumber();
        
        // ensure event contains correct information.
        return  config.thirdAirline     === event.airline    && 
                config.flight1Name      === event.flight     && 
                config.timestampFuture  === event.timestamp.toNumber();
    });
    
  });
  
  it("19. Oracles can submit response and emit OracleReport event only if oracle's indices contain the index in emitted event.", async() => {
    // fetchFlightStatus called from above so don't need to call again
    /** 
    await config.flightSuretyApp.fetchFlightStatus(  
                                            
                                            config.thirdAirline, 
                                            config.flight1Name,
                                            config.timestampFuture);
    **/
    //for (var i = 0; i< 1 ; i++) // oracle loop (do not loop through all oracles for this test.
    for (var i = 0; i< config.oracles.length ; i++)
    {
    
        let oracleIx = await config.flightSuretyApp.getMyIndexes({from: config.oracles[i]});
   
        //console.log("oracleTestIndex ", oracleTestIndex, " oracleIx ", oracleIx.toString());
        //console.log("config.thirdAirline    ",config.thirdAirline);  
        //console.log("config.flight1Name     ",config.flight1Name); 
        //console.log("config.timestampFuture ", config.timestampFuture);
  
        var submitOracleRes;
        try
        {   // test a status code that is not late airline
            var testStatus = 10; //Math.floor(Math.random()*STATUSCODES.length);
            
            submitOracleRes = await config.flightSuretyApp.submitOracleResponse(
                        
                                                                oracleTestIndex, 
                                                                config.thirdAirline,  
                                                                config.flight1Name, 
                                                                config.timestampFuture,
                                                                testStatus, 
                                                                {from: config.oracles[i]});
            // check OracleReport event emitted
            truffleAssert.eventEmitted(submitOracleRes, 'OracleReport', (event) => {
            
                //console.log("test 19: OracleReport event emitted ");
                //console.log("event.airline   ", event.airline);
                //console.log("event.flight    ", event.flight);
                //console.log("event.timestamp ", event.timestamp.toNumber());
                //console.log("event.status    ", event.status.toNumber());
                //console.log("config.thirdAirline === event.airline ", config.thirdAirline === event.airline); 
                //console.log("config.flight1Name  === event.flight ",config.flight1Name === event.flight );
                //console.log("config.timestampFuture  === event.timestamp ", config.timestampFuture  === event.timestamp.toNumber());
                //console.log("testStatus=== event.status.toNumber() ", testStatus=== event.status.toNumber());
                
                // Check index is one of oracle's indices
                // Cannot use indexOf() or includes() directly since elements are not 'number' type
                var hasIndex =  oracleTestIndex === oracleIx[0].toNumber() || 
                                oracleTestIndex === oracleIx[1].toNumber() || 
                                oracleTestIndex === oracleIx[2].toNumber();
                // ensure event contains correct information.
                return  hasIndex                                     &&
                        config.thirdAirline     === event.airline    && 
                        config.flight1Name      === event.flight     && 
                        config.timestampFuture  === event.timestamp.toNumber()  &&
                        testStatus              === event.status.toNumber();

            });
                                    
        }catch(e)
        {   
            //console.log("test 19 error ", e);
            
        }
        
    }// end oracle loop
    
  });

  it("20. Oracles can submit delay status (STATUS_CODE_LATE_AIRLINE) and emit FlightStatusInfo event.", async() => {
    // This test has oracles only submitting STATUS_CODE_LATE_AIRLINE
    
    // call fetchFlightStatus to open data request
   let fetch = await config.flightSuretyApp.fetchFlightStatus(  
                                            
                                            config.thirdAirline, 
                                            config.flight1Name,
                                            config.timestampFuture,
                                            {from: config.owner} );
                                            
    truffleAssert.eventEmitted(fetch, 'OracleRequest', async (event) => {
        //console.log("test 20: OracleRequest event emitted from fetchFlightStatus ");
        //console.log("event.index     ", event.index.toNumber());
        //console.log("event.airline   ", event.airline);
        //console.log("event.flight    ", event.flight);
        //console.log("event.timestamp ", event.timestamp.toNumber());
      
        // Assign test index
        oracleTestIndex = event.index.toNumber();
 
        // ensure event contains correct information.
        return  config.thirdAirline === event.airline    && 
                config.flight1Name  === event.flight     && 
                config.timestampFuture === event.timestamp.toNumber();
    }); 
    
    var submitOracleRes;
    var canEmitOracleReport = true;
    
    //for (var i = 0; i< 10 ; i++) // oracle loop (do not loop through all oracles for this test.
    for (var i = 0; i< config.oracles.length ; i++)
    {
     
        let oracleIx = await config.flightSuretyApp.getMyIndexes({from: config.oracles[i]});
        //console.log("oracleTestIndex ", oracleTestIndex, " oracleIx ", oracleIx.toString());
        
        try
        { 
            var oracle_nonce = await web3.eth.getTransactionCount(config.oracles[i]);
            submitOracleRes = await config.flightSuretyApp.submitOracleResponse(
                        
                                                                oracleTestIndex, 
                                                                config.thirdAirline,  
                                                                config.flight1Name, 
                                                                config.timestampFuture,
                                                                STATUS_CODE_LATE_AIRLINE, 
                                                                {from: config.oracles[i], nonce: oracle_nonce});
            // check OracleReport event emitted
            truffleAssert.eventEmitted(submitOracleRes, 'OracleReport', (event) => {
                //console.log("test 20: OracleReport event emitted ");
                //console.log("event.airline   ",  event.airline);
                //console.log("event.flight    ",  event.flight);
                //console.log("event.timestamp ",  event.timestamp.toNumber());
                //console.log("event.status    ",  event.status.toNumber());
                
                // Check index is one of oracle's indices
                // Cannot use indexOf() or includes() directly since elements are not 'number' type
                var hasIndex =  oracleTestIndex === oracleIx[0].toNumber() || 
                                oracleTestIndex === oracleIx[1].toNumber() || 
                                oracleTestIndex === oracleIx[2].toNumber();
                                
                // ensure event contains correct information.
                return  hasIndex                                      &&
                        config.thirdAirline      === event.airline    && 
                        config.flight1Name       === event.flight     && 
                        config.timestampFuture   === event.timestamp.toNumber()  &&
                        STATUS_CODE_LATE_AIRLINE === event.status.toNumber();
            });
            
            
                                    
        }catch(e)
        {   
            //console.log("test 20 error ", e);
            canEmitOracleReport = false;
            
        }
        
    }// end oracle loop
    
    // check FlightStatusInfo event emitted
    truffleAssert.eventEmitted(submitOracleRes, 'FlightStatusInfo', (event) => {
        //console.log("test 20: FlightStatusInfo event emitted ");
        //console.log("event.airline   ", event.airline);
        //console.log("event.flight    ", event.flight);
        //console.log("event.timestamp ", event.timestamp.toNumber());
        //console.log("event.status    ", event.status.toNumber());
        
        // ensure event contains correct information.
        return  config.thirdAirline      === event.airline        && 
                config.flight1Name       === event.flight         && 
                config.timestampFuture   === event.timestamp.toNumber()  &&
                STATUS_CODE_LATE_AIRLINE === event.status.toNumber();
    });
    
  });

  it('21. If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid', async () => {
  
    var isFlightRegistered = await config.flightSuretyData.isFlightRegistered(config.thirdAirline, config.flight1Name, config.timestampFuture, {from: config.secondAirline});
    //console.log("isFlightRegistered: ", isFlightRegistered);

    
    var viewPremium1 = await config.flightSuretyData.viewPremium(
                                                                    config.firstPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.firstPassenger});
    var viewPremium2 = await config.flightSuretyData.viewPremium(
                                                                    config.secondPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.secondPassenger});
    var viewBenefit1 = await config.flightSuretyData.viewBenefit(
                                                                    config.firstPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.firstPassenger});
    var viewBenefit2 = await config.flightSuretyData.viewBenefit(
                                                                    config.secondPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.secondPassenger});
    
    //console.log("viewPremium1 ",  web3.utils.fromWei(viewPremium1, "ether"));
    //console.log("viewPremium2  ", web3.utils.fromWei(viewPremium2, "ether"));
    //console.log("viewBenefit1 ",  web3.utils.fromWei(viewBenefit1, "ether"));
    //console.log("viewBenefit2  ", web3.utils.fromWei(viewBenefit2, "ether"));
    // ASSERT

    assert.equal(1.5*viewPremium1, viewBenefit1, "Benefit is not 1.5X premium paid by passenger.");
    assert.equal(1.5*viewPremium2, viewBenefit2, "Benefit is not 1.5X premium paid by passenger." );
    
  
  });

  it('22. Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout.', async () => {
  
    // ARRANGE 
    let pass1nonce =    await web3.eth.getTransactionCount(config.firstPassenger);
    var viewBenefit1 = await config.flightSuretyData.viewBenefit(
                                                                    config.firstPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.firstPassenger});
    let balanceBefore = await web3.eth.getBalance(config.firstPassenger);
    //console.log("firstPassenger balanceBefore ",balanceBefore, " benefit ", web3.utils.fromWei(viewBenefit1, "ether") );
  
    // ACT 
    
    // pay out the insurance
    /**
    await config.flightSuretyData.pay
                            (
                                config.firstPassenger,
                                config.thirdAirline,
                                config.flight1Name,
                                config.timestampFuture,
                                {from: config.firstPassenger, nonce: pass1nonce}
                            );**/
    try{
                          
    await config.flightSuretyApp.payInsurance
                            (
                                config.thirdAirline,
                                config.flight1Name,
                                config.timestampFuture,
                                {from: config.firstPassenger, nonce: pass1nonce}
                            );   
    } catch(e)
    {
        console.log("test 22 error ", e);
    }
                         
    // Check balanance after payout                        
    let balanceAfter = await web3.eth.getBalance(config.firstPassenger);
    
    //console.log("firstPassenger balanceAfter  ", balanceAfter );       
    
    var viewBenefit1After = await config.flightSuretyData.viewBenefit(
                                                                    config.firstPassenger, 
                                                                    config.thirdAirline,
                                                                    config.flight1Name, 
                                                                    config.timestampFuture,
                                                                    {from: config.firstPassenger});                 
    
    //console.log("vew benefit after payout ", web3.utils.fromWei(viewBenefit1After, "ether"));
    // ASSERT
    //console.log("typeof  balanceBefore  ", typeof  balanceBefore,  " typeof balanceAfter ", typeof balanceAfter) ;
    
  
    assert.equal(parseFloat(balanceBefore) < parseFloat(balanceAfter), true, "Balance did not increase after paying out insurance.");
  
  });
  
  });
 
        
   

   /** 
    
    2. Only existing airline may register a new airline until there are at least four airlines registered
    
    3. Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines
    
    4. Airline can be registered, but does not participate in contract until it submits funding of 10 ether
    
    5. Passengers may pay up to 1 ether for purchasing flight insurance.
    
    6. If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid
    
    7. Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout
    
    8. Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory
    
    9. Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)
  
  **/
 


