exports.id=0,exports.modules={"./src/server/server.js":function(e,t,r){"use strict";r.r(t);var n=r("./build/contracts/FlightSuretyApp.json"),o=r("./src/server/config.json"),s=r("web3"),a=r.n(s),c=r("express"),u=r.n(c);r("babel-polyfill");function l(e,t,r,n,o,s,a){try{var c=e[s](a),u=c.value}catch(e){return void r(e)}c.done?t(u):Promise.resolve(u).then(n,o)}function i(e){return function(){var t=this,r=arguments;return new Promise((function(n,o){var s=e.apply(t,r);function a(e){l(s,n,o,a,c,"next",e)}function c(e){l(s,n,o,a,c,"throw",e)}a(void 0)}))}}var g=o.localhost,f=new a.a(new a.a.providers.WebsocketProvider(g.url.replace("http","ws")));f.eth.defaultAccount=f.eth.accounts[0];var p=new f.eth.Contract(n.abi,g.appAddress),d=[0,10,20,30,40,50],v=["STATUS_CODE_UNKNOWN","STATUS_CODE_ON_TIME","STATUS_CODE_LATE_AIRLINE","STATUS_CODE_LATE_WEATHER","STATUS_CODE_LATE_TECHNICAL","STATUS_CODE_LATE_OTHER"],h=f.utils.toWei("1","ether"),m=[];(function(){var e=i(regeneratorRuntime.mark((function e(){var t,r,n,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("Register ",30," oracles"),e.next=3,f.eth.getAccounts();case 3:t=e.sent,r=t.length-1,n=0;case 6:if(!(n<30)){e.next=23;break}return e.prev=7,e.next=10,p.methods.registerOracle().send({from:t[r-n],value:h,gas:66e5});case 10:return e.next=12,p.methods.getMyIndexes().call({from:t[r-n]});case 12:o=e.sent,console.log("Oracle Registered ".concat(n,":  ").concat(o[0],", ").concat(o[1],", ").concat(o[2])),e.next=19;break;case 16:e.prev=16,e.t0=e.catch(7),console.log("register oracle error: ",e.t0);case 19:m.push(t[r-n]);case 20:n++,e.next=6;break;case 23:console.log("Done oracle registration.");case 24:case"end":return e.stop()}}),e,null,[[7,16]])})));return function(){return e.apply(this,arguments)}})()(),p.events.OracleRequest({fromBlock:"latest"},function(){var e=i(regeneratorRuntime.mark((function e(t,r){var n,o,s,a,c,u,l,i;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t&&console.log(t),n=r.returnValues.index,o=r.returnValues.airline,s=r.returnValues.flight,a=r.returnValues.timestamp,console.log("OracleRequent initiated"),console.log("event.returnValues.index ",r.returnValues.index),console.log("event.returnValues.airline ",r.returnValues.airline),console.log("event.returnValues.flight ",r.returnValues.flight),console.log("event.returnValues.timestamp ",r.returnValues.timestamp),c=0;case 11:if(!(c<30)){e.next=29;break}return u=Math.floor(Math.random()*d.length),l=d[u],e.prev=14,e.next=17,p.methods.getMyIndexes().call({from:m[c]});case 17:return(i=e.sent).includes(n)&&(console.log(" ++++++++++++++++ "),console.log("Oracle i ",c," index: ",n,"total number of oracles ",30),console.log("Oracle's indices: ",i),console.log("Status code submitted: ",l," string ",v[u])),e.next=21,p.methods.submitOracleResponse(n,o,s,a,l).send({from:m[c],gas:6666666},(function(e,t){}));case 21:e.sent,e.next=26;break;case 24:e.prev=24,e.t0=e.catch(14);case 26:c++,e.next=11;break;case 29:case"end":return e.stop()}}),e,null,[[14,24]])})));return function(t,r){return e.apply(this,arguments)}}()),p.events.FlightStatusInfo({fromBlock:"latest"},function(){var e=i(regeneratorRuntime.mark((function e(t,r){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("FlightStatusInfo event triggered"),console.log("Status code returned: ",r.returnValues.status);case 2:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}());var x=u()();x.get("/api",(function(e,t){t.send({message:"An API for use with your Dapp!"})})),t.default=x}};