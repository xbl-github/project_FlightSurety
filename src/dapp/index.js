
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
// See contract.js for function implementation details

(async() => {

    let result = null;
   
    
    
    let contract = new Contract('localhost', async () => {
    //let contract = new Contract('http://127.0.0.1:9545', () => {
        
        // update numberof registered airlines, and whether multiparty consensus in effect
        var numRegAirline = await contract.viewRegisteredAirlinesCount();
        var multiPartyThreshold = await contract.viewMutiPartyThreshold();
        
        var airlineRegStatusUpdate = DOM.elid("airline-reg-status-update")
        airlineRegStatusUpdate.innerHTML ="<p>Number of registered airlines "+numRegAirline+".  Multiparty consensus not required for up to "+multiPartyThreshold+" airlines.</p>";
        
        // Check whether (data) contract is operational
        contract.isOperational((error,result) => {
     
            let displayDiv = DOM.elid("operational-status");
            var status = error ? String(error) : String(result);
            displayDiv.innerHTML = "<span style='color: white; font-size:25px; background-color:red' >   "+ status + "</span>";
            //display("display-wrapper", 'Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
        

        // Display airlines in the UI
        displayAccounts("available-airlines-drop-down", contract.airlines);
        console.log("contract.registeredAirlines");
        console.log(contract.registeredAirlines);
        
        displayAccounts("registered-airlines-drop-down", contract.registeredAirlines);
        console.log("contract.fundedAirlines");
        console.log(contract.fundedAirlines);
        
        displayAccounts("funded-airlines-drop-down",     contract.fundedAirlines);
        
        // Display passengers in the UI
        displayAccounts("current-passengers-drop-down", contract.passengers);
              
        
        // ------ The following code adds event listeners
        
        /** 
            When "Register Airline" button is clicked, register another airline.
        
            Registration of fifth and subsequent airlines requires multi-party 
            consensus of 50% of registered airlines
        **/
        
        DOM.elid("reg-airline").addEventListener('click', async ()=>{
        
            console.log("reg airline is clicked");
            
            var toBeRegistered = DOM.elid("available-airlines-drop-down").value;
        
            var isReg = await contract.isAirlineRegistered(toBeRegistered)
            console.log("is ", toBeRegistered, " registered ", isReg);
            
            var displayRegInfo = DOM.elid("airline-reg-status");
            
            // If this airline is already registered, display to front end and stop function.
            if(isReg)
            {
                displayRegInfo.innerHTML = "Airline "+toBeRegistered+" is already registered.";
                return;
            }
            
            var fromAirline = DOM.elid("funded-airlines-drop-down").value;
            
            if (fromAirline == "")
            {
                displayRegInfo.innerHTML="Please select a funded airline to registered another available airline.";
                return;
            
            }
            console.log("register ", toBeRegistered, " from ", fromAirline);
            
            contract.registerAirline(toBeRegistered, fromAirline, async (error, result)=>{
                console.log("reg airline button click error ", error, " result ", result);
                
                /**
                    If there is an error from registering an airline, display it to the UI.
                **/
                if(error)
                {
                    displayRegInfo.innerHTML=error;
                    return;
                }
                console.log("reg airline button click error ", error, " result ", result);
                var isReg = await contract.isAirlineRegistered(toBeRegistered)
                
                //var status = error? String(error): String(result);
                
                var numRegistered = await contract.viewRegisteredAirlinesCount();
                
                var multiPartyThreshold = await contract.viewMutiPartyThreshold();
                
                console.log("number of registered airlines ", numRegistered, " threshold for multiparty threshold ", multiPartyThreshold);
                
                var airlineRegStatusUpdate = DOM.elid("airline-reg-status-update")
                /**
                    if the airline is registered, update dropdown to display airline
                **/
                if(isReg)
                {
                    // Update drop down with new registered airline
                    var registeredAirlinesDropDown = DOM.elid("registered-airlines-drop-down");
                    var newRegisteredAirline = DOM.makeElement("option");
                    newRegisteredAirline.innerHTML=toBeRegistered;
                    registeredAirlinesDropDown.add(newRegisteredAirline);
                    
                    contract.registeredAirlines.push(toBeRegistered);
                    
                    if(numRegistered <= multiPartyThreshold)
                    {
                        airlineRegStatusUpdate.innerHTML ="<p>Number of registered airlines "+numRegistered+".  Multiparty consensus not required for up to "+multiPartyThreshold+" airlines.</p>";
                        //"<p>"+ numRegistered <= multiPartyThreshold+"</p>
                        displayRegInfo.innerHTML ="<p>"+ numRegistered <= multiPartyThreshold+"</p><p>---Registration status of airline \""+toBeRegistered+"\": "
                                                    + isReg +".</p><p> Number of airlines registered: "
                                                    +numRegistered+" </p><p>Multiparty consensus not needed</p>";
                    
                    }else
                    {
                    
                        /**
                            Airline is registered after multiparty concensus in effect.
                            Display info to UI.
                        **/
                        airlineRegStatusUpdate.innerHTML ="<p>Number of registered airlines "+numRegistered+".  Multiparty consensus not required for up to "+multiPartyThreshold+" airlines.</p>";
                        var numVotes = await contract.viewNumVotes(toBeRegistered);
                        console.log("airline ", toBeRegistered, " votes ", numVotes);
                        displayRegInfo.innerHTML =   "<p>Multiparty consensus in effect.</p>"
                                                    +"<p>Registration status of airline: \" "+toBeRegistered+"\" : "+ isReg +" </p>"
                                                    +"<p>Number of votes from funded airlines: "+numVotes+"."
                                                    +"Total number of registered airlines: "+numRegistered+".</p>";
                    }

                }
                
                /** 
                    Airline is not registered after multiparty concensus in effect, waiting for more votes.
                    The UI is updated to provide this info to the user.
                **/
                if(!isReg && (numRegistered >= multiPartyThreshold))
                {
                        airlineRegStatusUpdate.innerHTML ="<p>Number of registered airlines "+numRegistered+".  Multiparty consensus not required for up to "+multiPartyThreshold+" airlines.</p>";
                        var numVotes = await contract.viewNumVotes(toBeRegistered);
                        displayRegInfo.innerHTML =   "<p>Multiparty consensus in effect.</p>"
                                                    +"<p>Registration status of airline: \" "+toBeRegistered+"\" : "+ isReg +" </p>"
                                                    +"<p>Number of votes from funded airlines: "+numVotes+"."
                                                    +"Total number of registered airlines: "+numRegistered+".</p>"
                                                    +"<p>Minimum number of votes needed to register airline: "+Math.floor(0.5*numRegistered)+"</p>";
                }
              
            });
            
                
            console.log("DONE PROCESSING CLICK REG AIRLINE")
        });
        
        
        
        /** 
            When "Fund Airline" button is clicked, the selected airline funds the insurance contract.
        **/
        DOM.elid("fund-airline").addEventListener('click', async ()=>{
            console.log("fund airline clicked");
            var airlineSelect = DOM.elid("registered-airlines-drop-down").value;
     
            console.log("select for funding: ", airlineSelect);
  
            var hasFunded = await contract.hasAirlineFunded(airlineSelect);
            console.log("airline ", airlineSelect, " has funded ", hasFunded);
            var fundingStatus= DOM.elid("fund-airline-status")
            
            if(hasFunded==true)
            {
                
                fundingStatus.innerHTML="Airline "+airlineSelect+" has previously funded.";
            }
            // If this airline has not funded, allow it to fund.
            else
            {   
                var fee = "10"; //contract.web3.utils.toWei(10)
                contract.fundAirline(airlineSelect, fee, (error, result)=>{
                    console.log("in fund airline call back");
                    console.log("error ", error, " result ", result);
                    
                    var fundedAirlineDropDown = DOM.elid("funded-airlines-drop-down");
                    var newFundedAirline = DOM.makeElement("option");
                    newFundedAirline.innerHTML=airlineSelect;
                    fundedAirlineDropDown.add(newFundedAirline);
                    
                    fundingStatus.innerHTML="Airline "+airlineSelect+" has funded the insurance.";
                    //contract.fundedAirlines.push(airlineSelect);
                
                });
            
            }

            /** 
                Set the flights to an empty object since no flights 
                have been added yet.
            **/
            //flightSchedule[airlineSelect]=[];
            console.log("done fund airline");
            
            console.log("FINISHED PROCESSING CLICK");
        });
        
        /**
            When "View Total Fund" button is clicked, display the current insurance fund balance.
        **/
        
        DOM.elid("view-total-fund").addEventListener('click', ()=>{
            
                contract.viewTotalFund((error, result)=>{
                
                    console.log("error ", error, " result ", result);
                    var totalFund = contract.web3.utils.fromWei(result, "ether");
                    console.log("total fund ", totalFund);
                    
                    var status = DOM.elid("total-fund-status")
                    status.innerHTML="Total Insurance Fund Balance: "+totalFund+" ethers.";
                
                
                });
        });
        
        
        
        
        // Button for registering a flight and adding it to the flights drop down
        
        DOM.elid("register-flight-button").addEventListener('click', async ()=>{
        
           console.log("add reg flight clicked");
            
            var fundedAirline = DOM.elid("funded-airlines-drop-down").value;
            
            // Access add flight display tag
            var status = DOM.elid("reg-flight-status");
            
            // If no funded airline is selected, do not add a flight
            if (fundedAirline=="")
            {
                console.log("NO FUNDED AIRLINE");   
                status.innerHTML ="NO FUNDED AIRLINE SELECTED! Cannot add flight." 
                return;
                
            }
            console.log("adding flight to fundedAirline ", fundedAirline);
            
            var flightSelected = DOM.elid("available-flights-drop-down").value;
            
            console.log("flightSelected ", flightSelected);
            if (flightSelected == "")
            {
            
                status.innerHTML = "NO AVAILABLE FLIGHT SELECTED!"
                return;
            }
            
            var flightObject = contract.availableFlights[fundedAirline][flightSelected]
            console.log("flightObject ")
            console.log(flightObject);
            
            var airline_to_reg   = flightObject.airline;
            var flight_to_reg    = flightObject.flight
            var timestamp_to_reg = flightObject.timestamp;
            
            console.log("airline_to_reg ", airline_to_reg);
            console.log("flight_to_reg ", flight_to_reg);
            console.log("timestamp_to_reg ", timestamp_to_reg);
            
            var isFlightRegistered = await contract.isFlightRegistered(airline_to_reg, flight_to_reg, timestamp_to_reg);
            console.log("isFlightRegistered ", isFlightRegistered);
            
            // If flight is already registered, do not add to drop down again.
            if(isFlightRegistered)
            {
                return;
            }
            
            // Flight is not registered, register it and add to both registeredFlights and drop down.
            contract.registerFlight(
                                        airline_to_reg, 
                                        flight_to_reg, 
                                        timestamp_to_reg, 
                                        (error, result)=>{
            
                    console.log("register flight error ", error, " result ", result);
                    var regFlightsDropDown = DOM.elid("registered-flights-drop-down");
                    var option = DOM.makeElement("option");
                    option.innerHTML = flightSelected;
                    regFlightsDropDown.add(option);
                    
                    contract.registeredFlights[fundedAirline][flightSelected] = flightObject;
                    
                    var regFlights = Object.keys(contract.registeredFlights[fundedAirline]);
                    var regStatus = DOM.elid("choose-reg-flight");
        
                    if (regFlights.length == 0)
                    {
                        regStatus.innerHTML = "No Registered Flights Available";   
                        
                    }else if(regFlights.length == 1)
                    {
                        regStatus.innerHTML = "<p>"+regFlights.length+" registered flight available</p><p>Select a registered flight for insuring</p>"
                    
                    }else if(regFlights.length > 1)
                    {
                        regStatus.innerHTML = "<p>"+regFlights.length+" registered flights available</p><p>Select a registered flight for insuring</p>"
                    
                    }
                    
            });
        });
        
        
        /** 
            When a funded airline is selected, the following event listeners shows 
            its available and registered flights.
        **/
        DOM.elid("funded-airlines-drop-down").addEventListener('change', ()=>{
            
           
            var airlineSelected = DOM.elid("funded-airlines-drop-down").value;
            
            if (airlineSelected == "")
            {
                // nothing to do if an empty option is selected
                displayAccounts("available-flights-drop-down", []);
                displayAccounts("registered-flights-drop-down", []);
                return;
            }
            console.log("funded airline selected: ", airlineSelected);
            
            var flights = Object.keys(contract.availableFlights[airlineSelected]);
            console.log("available flights ", flights);
            
            // display flights in drop down
            displayAccounts("available-flights-drop-down", flights)
            
            var regFlights = Object.keys(contract.registeredFlights[airlineSelected]);
            var regStatus = DOM.elid("choose-reg-flight");
            
            if (regFlights.length == 0)
            {
                regStatus.innerHTML = "No Registered Flights Available";   
                
            }else if(regFlights.length == 1)
            {
                regStatus.innerHTML = "<p>"+regFlights.length+" registered flight available</p><p>Select a registered flight for insuring</p>"
            
            }else if(regFlights.length > 1)
            {
                regStatus.innerHTML = "<p>"+regFlights.length+" registered flights available</p><p>Select a registered flight for insuring</p>"
            
            }
            
            displayAccounts("registered-flights-drop-down", regFlights)
        });
     
        // Get flight status from oracles
        DOM.elid('submit-oracle').addEventListener('click', ()=>{
           
           
            let flightString    = DOM.elid("registered-flights-drop-down").value
            let airlineSelected = DOM.elid("funded-airlines-drop-down").value;
            
            var flightObject = contract.registeredFlights[airlineSelected][flightString]
            
            console.log("fetch flight status callback ");
            
            
            var airline     = flightObject.airline;
            var flightNum   = flightObject.flight;
            var timestamp   = flightObject.timestamp;
            
            // Write transaction
            console.log("Info to send to smart contract")
            console.log("airline "+ airline);
            console.log("flightNum "+ flightNum);
            console.log("time "+timestamp.toString()+ " timestamp "+ timestamp );
            
            // Call smart contract which in turn will call oracles
            contract.fetchFlightStatus(airline, flightNum, timestamp, (error, result) => {
                
                display("check-flight-display", 'Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status for', error: error, value: flightString} ]);
                    
                });
        });
    
        // This button displays the amount of premium paid by passenger for a flight
        DOM.elid("view-premium").addEventListener('click', ()=>{
        
            console.log(" view-premium button clicked");
            var passenger     = DOM.elid("current-passengers-drop-down").value;
            var airline       = DOM.elid("funded-airlines-drop-down").value;
            var flightString  = DOM.elid("registered-flights-drop-down").value;
            
            var flightObject  = contract.registeredFlights[airline][flightString]
            
            console.log("flightObject ", flightObject);
            /**
                "flight" and "flightString" should be the same info.  
                It is possible to modify flightObject to only hold the timestamp, 
                which can be passed to the smart contract since Solidity and 
                JavaScript use different timestamps.
            **/
            
            var flight    = flightObject.flight;
            var timestamp = flightObject.timestamp;
            
            
            contract.viewPremium(passenger, airline, flight, timestamp, (error, result)=>{
            
                console.log("error ", error, " result ", result);
                var premiumEther = contract.web3.utils.fromWei(result, "ether");
                var premiumStatus = DOM.elid("premium-status");
                premiumStatus.innerHTML="<p>Passenger: "+passenger+"</p>"
                                         +"<p>Flight: "+flightString+"</p>"
                                         +"<p>Airline: "+airline +" </p>"
                                         +"<p>Premium paid for flight insurance: "+premiumEther+"</p>";
            
            });
        });
    
        // This button displays the amount of benefit paid to the passenger for a flight
        DOM.elid("view-benefit").addEventListener('click', ()=>{
        
            console.log(" view benefit button clicked");
            
            var passenger    = DOM.elid("current-passengers-drop-down").value;
            var airline      = DOM.elid("funded-airlines-drop-down").value;
            var flightString = DOM.elid("registered-flights-drop-down").value;
            
            var flightObject  = contract.registeredFlights[airline][flightString]
            
            var flight    = flightObject.flight;
            var timestamp = flightObject.timestamp;
            
            contract.viewBenefit(passenger, airline, flight, timestamp, (error, result)=>{
            
                console.log(" view benefit button error ", error, " result ", result);
                var benefitEther = contract.web3.utils.fromWei(result, "ether")
                
                var insuranceStatus = DOM.elid("insurance-status");
                insuranceStatus.innerHTML="<p>Passenger: "+passenger+"</p>"
                                         +"<p>Flight: "+flightString+"</p>"
                                         +"<p>Airline: "+airline +" </p>"
                                         +"<p>Benefit for flight insurance: "+benefitEther+"</p>";
            
            });
            
        });
        
        // When the "Buy Insurance" button is clicked, buy flight insurance.
        DOM.elid("buy-insurance").addEventListener('click', ()=>{
            
            console.log("buy insurance button clicked");
            
            var passenger    = DOM.elid("current-passengers-drop-down").value;
            var airline      = DOM.elid("funded-airlines-drop-down").value;
            var flightString = DOM.elid("registered-flights-drop-down").value;
            
            var flightObject  = contract.registeredFlights[airline][flightString]
            
            var flight    = flightObject.flight;
            var timestamp = flightObject.timestamp;
            var premium   = DOM.elid("premium-amount").value;
            
            var premiumStatus = DOM.elid("premium-status");
            
            if (premium>1)
            {
                premiumStatus.innerHTML = "Premium must be less than or equal to 1 ether."
                return;
                
            }
            
            contract.buyInsurance(airline, flight, timestamp, passenger, premium, (error, result)=>{
            
                   console.log("buy insurance error ", error, " result ", result);
                   
                   
                   premiumStatus.innerHTML = "<p>Passenger "+passenger+" has paid flight surety insurance premium for flight "+flight+" airline "+airline+"</p>";
            
            })
        });
        
        // This button withdraws a passenger's benefit to the passenger's account
        DOM.elid("withdraw-benefit").addEventListener('click', async ()=>{
        
            console.log("withdraw benefit button clicked");
            var passenger    = DOM.elid("current-passengers-drop-down").value;
            var airline      = DOM.elid("funded-airlines-drop-down").value;
            var flightString = DOM.elid("registered-flights-drop-down").value;
            
            var flightObject  = contract.registeredFlights[airline][flightString]
            
            var flight    = flightObject.flight;
            var timestamp = flightObject.timestamp;
            
            var balanceBefore =  await contract.web3.eth.getBalance(passenger);
            balanceBefore = contract.web3.utils.fromWei(balanceBefore, "ether")
            
            contract.withdrawBenefit(airline, flight, timestamp, passenger, async ()=>{
            
                var balanceAfter =  await contract.web3.eth.getBalance(passenger);
                balanceAfter = contract.web3.utils.fromWei(balanceAfter, "ether")
                
                console.log("passenger ", passenger);
                var insuranceStatus = DOM.elid("insurance-status");
                insuranceStatus.innerHTML="<p>Insurance benefit has been withdrawn and deposited into passenger account: "+passenger+" for </p><p>flight "+flightString+".</p><p>Passenger's account balance before withdrawal: "+balanceBefore+" </p><p>Passenger's account balance after withdrawal :"+balanceAfter+" ethers</p>"
                                
            
            })
        });
        
       
       
       
       
       contract.flightSuretyApp.events.OracleRequest({fromBlock: 'latest'}, ()=>{
        console.log("-----------------------");
        console.log("Oracle Request event fired");
        
       });
       
       
       console.log(" END let new contract =... "); 

    });// end new Contract()
    

})();


function display(id, title, description, results) {
    let displayDiv = DOM.elid(id);
    let section = DOM.section();
    displayDiv.innerHTML = ""; // erase previous displayed message
    section.appendChild(DOM.h2(title));
    //section.appendChild(DOM.h5(description));
    section.appendChild(DOM.p(description));
    console.log("results ", results);
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        console.log("result ", result);
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, 
            result.error ? String(result.error) : String(result.value)));
        
        section.appendChild(row);
    })
    displayDiv.append(section);

}

// Create a drop down of flights
function flightDropDown(flightList){   
    // Access the drop-down manual's select tag
    let regFlightsDropDown = DOM.elid("flights-drop-down");
        
    flightList.map((result) => {
            var flightInfo = result.airline + " "+ result.flight + " @ "  + result.timestamp.toString()
            console.log("in map ", flightInfo)
            
            let flightOption = DOM.makeElement("option");
            flightOption.innerHTML = flightInfo;
            regFlightsDropDown.add(flightOption)
    });
}
// Add a flight to the flight drop down

function AddToFlightDropDown(flightInfo){

    var regFlightsDropDown = DOM.elid("flights-drop-down");
    var addFlightLabel = DOM.elid("choose-a-flight");
    //console.log("addFlightLabel.innerHTML ", addFlightLabel.innerHTML)
    
    if(addFlightLabel.innerHTML.includes("No Flights"))
    {
        addFlightLabel.innerHTML="Choose a Flight for above selected funded airline";
    }

    // If the flight info is already in the drop down, don't add it again.
    if(DOM.elid(flightInfo) != null)
    {
        return;
    }
    var newFlightOption = DOM.makeElement("option");
    newFlightOption.setAttribute("id", flightInfo);
    newFlightOption.innerHTML = flightInfo;
       
    
    regFlightsDropDown.add(newFlightOption)
}

// Display accounts in a drop down, for example airlines and passengers.
function displayAccounts(tagName, accounts)
{
    var dropDown = DOM.elid(tagName)
    
    // Erase any previous options displayed in drop down
    
    dropDown.innerHTML = "<option></option>";
        for (var i in accounts)
        {
        
            //console.log(tagName+" "+accounts[i]);
            var dropDownOption = DOM.makeElement("option");
            
            dropDownOption.innerHTML = accounts[i]
            dropDownOption.style.fontFamily='Courier, monospace';
            dropDown.add(dropDownOption);
        }
}

function showFlights(flightSchedule)
{
    
    
    // Show flights for airline
    /** 
        generic formula to generate a random number with in range:
        Math.floor(Math.random()*(end Number - start Number +1) + start Number) 
    **/
    
    if(flightSchedule == undefined)
    {
        flightSchedule = []
    }
    console.log(flightSchedule.length)
    
    // Access the flight drop down
    var flightsList = DOM.elid("flights-drop-down");
    
    // Access the label to the flights drop down
    var addFlightLabel = DOM.elid("choose-a-flight");
    
    // Zero out the flights drop down
    flightsList.innerHTML ="";
    
    // The first option in the flight list is an empty option
    var nullOption       = DOM.makeElement("option");
    
    flightsList.add(nullOption)
    /**
        If this airline has no flights, use a label that says 
        "No Flights Available".
        
    **/
    if (flightSchedule.length===0)
    {
        //nullOption.innerHTML = "No flights for this airline";
        
        addFlightLabel.innerHTML="No Flights Available";
        
    }
    // If this airline has flights, show in label 
    else
    {
        for (var i in flightSchedule)
        {
            var flightOption = DOM.makeElement("option");
            flightOption.innerHTML = flightSchedule[i];
            flightsList.add(flightOption);
        
        }
        
    }
    


}

