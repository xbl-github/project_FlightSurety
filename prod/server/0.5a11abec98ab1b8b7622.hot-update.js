exports.id=0,exports.modules={"./src/server/server.js":function(e,o,s){"use strict";s.r(o);var t=s("./build/contracts/FlightSuretyApp.json"),r=s("./src/server/config.json"),n=s("web3"),c=s.n(n),l=s("express"),a=s.n(l),i=r.localhost,g=new c.a(new c.a.providers.WebsocketProvider(i.url.replace("http","ws"))),u=new g.eth.Contract(t.abi,i.appAddress),h=g.utils.toWei("1","ether"),p=[];g.eth.getAccounts((function(e,o){console.log("web3.eth.getAccounts"),console.log("accounts.length ",o.length);for(var s=o.length-1,t=0;t<5;t++){try{console.log("registering oracle"),u.methods.registerOracle().send({from:o[s],value:h,gas:66e5})}catch(e){console.log("error registering oracles ",e)}console.log("i ",t," accounts[i] ",o[t]," j ",s," accounts[j] ",o[s]),p.push(o[s]),s--}})),u.events.OracleRequest({fromBlock:"latest"},(function(e,o){e&&console.log(e),console.log(o)}));var d=a()();d.get("/api",(function(e,o){o.send({message:"An API for use with your Dapp!"})})),o.default=d}};