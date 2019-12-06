exports.id=0,exports.modules={"./src/server/server.js":function(e,n,r){"use strict";r.r(n);var t=r("./build/contracts/FlightSuretyApp.json"),o=r("./src/server/config.json"),s=r("web3"),c=r.n(s),l=r("express"),a=r.n(l);function u(e,n,r,t,o,s,c){try{var l=e[s](c),a=l.value}catch(e){return void r(e)}l.done?n(a):Promise.resolve(a).then(t,o)}function i(e){return function(){var n=this,r=arguments;return new Promise((function(t,o){var s=e.apply(n,r);function c(e){u(s,t,o,c,l,"next",e)}function l(e){u(s,t,o,c,l,"throw",e)}c(void 0)}))}}var g=o.localhost,f=new c.a(new c.a.providers.WebsocketProvider(g.url.replace("http","ws"))),h=new f.eth.Contract(t.abi,g.appAddress),p=f.utils.toWei("1","ether"),v=[];f.eth.getAccounts(function(){var e=i(regeneratorRuntime.mark((function e(n,r){var t,o,s;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(console.log("web3.eth.getAccounts"),console.log("accounts.length ",r.length),t=r.length-1,o=function(e){v.push(r[t]);try{console.log("registering oracle"),h.methods.registerOracle().send({from:r[t],value:p,gas:66e5}).then((function(n){h.methods.getMyIndexes().call({from:r[t]}).then((function(n){console.log("i ",e," accounts[i] ",r[e]," j ",t," accounts[j] ",r[t]," indices ",n)}))}))}catch(e){console.log("error registering oracles ",e)}t--},s=0;s<20;s++)o(s);case 5:case"end":return e.stop()}}),e)})));return function(n,r){return e.apply(this,arguments)}}()),h.events.OracleRequest({fromBlock:"latest"},function(){var e=i(regeneratorRuntime.mark((function e(n,r){var t,o,s,c,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:n&&console.log(n),console.log("------------------------------------------------"),console.log("*** event detected *** "),console.log(" event.returnValues.index     ",r.returnValues.index),console.log(" event.returnValues.airline   ",r.returnValues.airline),console.log(" event.returnValues.flight    ",r.returnValues.flight),console.log(" event.returnValues.timestamp ",r.returnValues.timestamp),console.log(" oracles.length ",v.length),t=r.returnValues.index,o=r.returnValues.airline,s=r.returnValues.flight,c=r.returnValues.timestamp,l=0;case 13:if(!(l<20)){e.next=29;break}return 20,console.log(" ++++++++++++++++ "),console.log(" ask oracle i= ",l),e.prev=17,e.next=20,h.methods.submitOracleResponse(t,o,s,c,20).send({from:v[l],gas:6666666});case 20:e.next=25;break;case 22:e.prev=22,e.t0=e.catch(17),console.log("error");case 25:console.log(" -----------------");case 26:l++,e.next=13;break;case 29:console.log("---------------END FOR LOOP ---------------------------------");case 30:case"end":return e.stop()}}),e,null,[[17,22]])})));return function(n,r){return e.apply(this,arguments)}}());var d=a()();d.get("/api",(function(e,n){n.send({message:"An API for use with your Dapp!"})})),n.default=d}};