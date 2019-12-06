pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    
    
    
    //----------------------------------------------------------------
    // Airline data:
    // Purpose: Tracks airline's registration status and amount funded to determine
    // whether they can vote in multiparty consensus.
    // If this struct is likely to change, then it can be placed in the app contract instead.
    // Current implementation places this struct in the data contract because this
    // implementation assume this struct will not change.
    
    struct Airline{
        bool           isRegistered;
        uint256        amountFunded;
    }
    mapping(address => Airline) private registeredAirlines; // tracks which airlines registered
    
    // Number of registered and funded airlines (needed for multiparty consensus)
    uint256 private registeredAirlinesCount = 0; 
    uint256 private totalFund               = 0; // total amount funded by airlines
    
    //----------------------------------------------------------------
    // Flight data:
    // track which flights are registered and insurance is available
    mapping(bytes32 => bool) private registeredFlights; 
    
    //----------------------------------------------------------------
    // Insurance data
    
    mapping (bytes32 => address[]) flightInsurees; // each flight's insurees
    
    // for each passenger, which flight did they pay premium for.
    mapping (address => mapping(bytes32 => uint256)) premiums; 
    
    // for each flight, which passengers bought insurance.  
    mapping (bytes32 => mapping(address => uint256)) benefits;
 
    
    
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function returnOwner() public view returns(address)
    {
        return contractOwner;
    }
    
    // Return number of registered airlines
     
    function viewRegisteredAirlinesCount
                                           (
                                           ) 
                                           external 
                                           view 
                                           requireIsOperational
                                           returns(uint256)
    {
        return registeredAirlinesCount;
    }
    
    // Return whether airline is registered
    function isAirlineRegistered (
                                   address airline 
                                 ) 
                                 external
                                 view
                                 requireIsOperational
                                 returns(bool)
                                 
                                 
    {
        return registeredAirlines[airline].isRegistered;
    }
    
    // Return whether flight is registered
    function isFlightRegistered
                                (
                                    address airline,
                                    string  flight,
                                    uint256 timestamp
                                )
                                external
                                view
                                requireIsOperational
                                returns(bool)
    {
        bytes32 key = getFlightKey(airline, flight, timestamp);    
        return registeredFlights[key];
    
    }
                                
    // Return the amount, note: view is used in function name to clarify money is not transfered.
    function viewFundAmount (
                                address airline
                           )
                           external
                           view
                           requireIsOperational
                           returns(uint256)
    {
    
        return registeredAirlines[airline].amountFunded;
    }
    // Get total insurance fund, note: view is used in function name to clarify money is not transfered.
    function viewTotalFund
                            (
                            ) 
                            external 
                            view 
                            requireIsOperational 
                            returns(uint256)
    {
        return totalFund;
    }
    
    // View premium paid by passenger, note: view is used in function name to clarify money is not transfered.
    function viewPremium
                        (
                            address     passenger,
                            address     airline,
                            string      flight,
                            uint256     timestamp   
                        )
                        external
                        view
                        requireIsOperational
                        returns(uint256)
    {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        return premiums[passenger][key];
    }
    
    // View benefit amount, note: view is used in function name to clarify money is not transfered.
    function viewBenefit
                         (
                            address     passenger,
                            address     airline,
                            string      flight,
                            uint256     timestamp   
                         )
                         external
                         view
                         requireIsOperational
                         returns(uint256)
    {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        return benefits[key][passenger];
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                address airline
                            )
                            external
                            requireIsOperational
                            
    {
        registeredAirlines[airline] = Airline({ 
                                        isRegistered: true,
                                        amountFunded: 0
                                    });
        
        // increase number of registered airlines
        registeredAirlinesCount = registeredAirlinesCount.add(1);
    }


    
    function registerFlight 
                            (
                                address airline,
                                string flight,
                                uint256 timestamp
                            ) 
                            external
                            requireIsOperational
    {
        require(registeredAirlines[airline].isRegistered == true, "Cannot register flight for a non-registered airline.");
        
        bytes32 key = getFlightKey(airline, flight, timestamp);
        
        // Ensure this flight for this airline has not been registered yet.
        require(registeredFlights[key] == false, "Flight is already registered.");
        
        registeredFlights[key] = true;
    
    }
    
    /**
    * @dev Buy insurance for a flight
        
      Buy insurance for one flight for one person.
      This function is payable so premium is is msg.value.
    *
    */   
    function buy
                            (
                                address     passenger,
                                address     airline,
                                string      flight,
                                uint256     timestamp                            
                            )
                            external
                            payable
                            requireIsOperational
    {
        
        bytes32 key = getFlightKey(airline, flight, timestamp);
        
        require(premiums[passenger][key] == 0, "This passenger has paid premiums for this flight already.");
   
        // Add passenger to the list of passengers that bought insurance for this flight
        flightInsurees[key].push(passenger);
        
        // Update for this passenger which flights they bought insurance for 
        premiums[passenger][key] = msg.value;
    
        // Set benefit payout to 0 for this passenger.  
        benefits[key][passenger] = 0; 

    }
    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address         insuree,
                                address         airline,
                                string          flight,
                                uint256         timestamp   
                            )
                            external
                            payable
                            requireIsOperational
    {
        // retrieve insurees for flight
        bytes32 key = getFlightKey(airline, flight, timestamp);
        
        // lookup the payout for insuree
        uint256 payout = benefits[key][insuree];
        
        // Require this insuree to have non-zero benefit payout
        require(payout >0, "Nothing to payout." );
        
       
        // zero out benefit
        benefits[key][insuree] = 0; 
        
        // transfer payout to insuree
        insuree.transfer(payout);
        
    
    }
    
    /**
     *  @dev Credits payouts to insurees
        Credit all insurees of one flight.
        
        NOTE: 
        
        Current implementation has benefit calculation in this function, 
        which is in the data contract.  
        
        An alternative is to perform the benefit calculation in the app contract 
        to allow for any future changes in calculation to be made in the app contract.
    */
    function creditInsurees
                                (
                                    bytes32 key 
                                )
                                external
                                requireIsOperational
    {
    
        // Loop through all insurees for flight and credit their benefit
        uint256 countInsuree = flightInsurees[key].length;
        
        for (uint256 i = 0; i< countInsuree; i++)
        {
            // i-th passenger on this flight
            address passenger_i = flightInsurees[key][i];
            
            // Insurance payout calcuation
            // Pay the i-th insuree 1.5 times the amount they paid in premiums.
            uint256 benefitCredit = premiums[passenger_i][key].mul(3).div(2);
            
            // If there is insufficient fund, stop the crediting process.
            
            require(benefitCredit < totalFund, "Total fund is insufficient to credit insurance.");
            
            // add to this passenger's benefit payout
            benefits[key][passenger_i] = benefits[key][passenger_i].add(benefitCredit); 
            
            totalFund = totalFund.sub(benefitCredit); // substract from total fund
            
        }
    
    }
    

    

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                         
                            )
                            public
                            payable
                            requireIsOperational
    {
        // require airline is registered before it can fund
        require(registeredAirlines[msg.sender].isRegistered, "Airline must register before funding.");
        require(registeredAirlines[msg.sender].amountFunded == 0 ether, "Airline has already funded.");
        
        registeredAirlines[msg.sender].amountFunded = registeredAirlines[msg.sender].amountFunded.add(msg.value);

        totalFund = totalFund.add(msg.value); // update total fund
        
        
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        //fund(msg.sender, msg.value);
        //fund();
    }


}

