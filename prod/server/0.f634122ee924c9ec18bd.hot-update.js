exports.id=0,exports.modules={"./src/server/server.js":function(e,r,n){"use strict";n.r(r);var t=n("./build/contracts/FlightSuretyApp.json"),o=n("./src/server/config.json"),s=n("web3"),a=n.n(s),c=n("express"),l=n.n(c);function u(e,r,n,t,o,s,a){try{var c=e[s](a),l=c.value}catch(e){return void n(e)}c.done?r(l):Promise.resolve(l).then(t,o)}function i(e){return function(){var r=this,n=arguments;return new Promise((function(t,o){var s=e.apply(r,n);function a(e){u(s,t,o,a,c,"next",e)}function c(e){u(s,t,o,a,c,"throw",e)}a(void 0)}))}}var g=o.localhost,p=new a.a(new a.a.providers.WebsocketProvider(g.url.replace("http","ws"))),v=new p.eth.Contract(t.abi,g.appAddress),f=p.utils.toWei("1","ether"),h=[];p.eth.getAccounts(function(){var e=i(regeneratorRuntime.mark((function e(r,n){var t,o,s;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("web3.eth.getAccounts"),console.log("accounts.length ",n.length),t=n.length-1,o=0;case 4:if(!(o<5)){e.next=22;break}return e.prev=5,console.log("registering oracle"),v.methods.registerOracle({from:n[t],value:f,gas:66e5}),e.next=10,v.methods.getMyIndexes().call({from:n[t]});case 10:s=e.sent,console.log("i ",o," accounts[i] ",n[o]," j ",t," accounts[j] ",n[t]," indices ",s),h.push(n[t]),e.next=18;break;case 15:e.prev=15,e.t0=e.catch(5),console.log("error registering oracles ",e.t0);case 18:t--;case 19:o++,e.next=4;break;case 22:case"end":return e.stop()}}),e,null,[[5,15]])})));return function(r,n){return e.apply(this,arguments)}}()),v.events.OracleRequest({fromBlock:"latest"},function(){var e=i(regeneratorRuntime.mark((function e(r,n){var t,o,s,a,c;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r&&console.log(r),console.log("------------------------------------------------"),console.log("*** event detected *** "),console.log(" event.returnValues.index     ",n.returnValues.index),console.log(" event.returnValues.airline   ",n.returnValues.airline),console.log(" event.returnValues.flight    ",n.returnValues.flight),console.log(" event.returnValues.timestamp ",n.returnValues.timestamp),console.log(" oracles.length ",h.length),t=n.returnValues.index,o=n.returnValues.airline,s=n.returnValues.flight,a=n.returnValues.timestamp,c=0;case 13:if(!(c<5)){e.next=29;break}return 20,console.log(" ++++++++++++++++ "),console.log(" ask oracle i= ",c),e.prev=17,e.next=20,v.methods.submitOracleResponse(t,o,s,a,20).send({from:h[c],gas:6666666});case 20:e.next=25;break;case 22:e.prev=22,e.t0=e.catch(17),console.log("error");case 25:console.log(" -----------------");case 26:c++,e.next=13;break;case 29:console.log("---------------END FOR LOOP ---------------------------------");case 30:case"end":return e.stop()}}),e,null,[[17,22]])})));return function(r,n){return e.apply(this,arguments)}}());var d=l()();d.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})})),r.default=d}};