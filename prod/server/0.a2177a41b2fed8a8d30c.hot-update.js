exports.id=0,exports.modules={"./src/server/server.js":function(e,t,n){"use strict";n.r(t);var o=n("./build/contracts/FlightSuretyApp.json"),r=n("./src/server/config.json"),s=n("web3"),c=n.n(s),a=n("express"),l=n.n(a);function i(e,t,n,o,r,s,c){try{var a=e[s](c),l=a.value}catch(e){return void n(e)}a.done?t(l):Promise.resolve(l).then(o,r)}var u=r.localhost,g=new c.a(new c.a.providers.WebsocketProvider(u.url.replace("http","ws")));g.eth.defaultAccount=g.eth.accounts[0];var d=new g.eth.Contract(o.abi,u.appAddress),f=g.utils.toWei("1","ether"),v=[];(function(){var e,t=(e=regeneratorRuntime.mark((function e(){var t,n,o,r,s;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("register oracles"),e.next=3,g.eth.getAccounts();case 3:t=e.sent,n=t.length-1,o=0;case 6:if(!(o<30)){e.next=19;break}return console.log("i ",o," start - i ",n-o," accounts ",t[n-o]),e.next=10,d.methods.registerOracle({from:t[n-o],value:f,gas:66e5,gasPrice:1e5});case 10:return e.next=12,d.methods.getMyIndexes({from:t[n-o]});case 12:r=e.sent,console.log("Oracle Registered ".concat(o,":  ").concat(r[0],", ").concat(r[1],", ").concat(r[2])),v.push(t[n-o]),console.log("---");case 16:o++,e.next=6;break;case 19:o=0;case 20:if(!(o<30)){e.next=29;break}return console.log(" oracle ",o," address ",v[o]),e.next=24,d.methods.getMyIndexes({from:v[o]});case 24:s=e.sent,console.log("Oracle Registered ".concat(o,":  ").concat(s[0],", ").concat(s[1],", ").concat(s[2]));case 26:o++,e.next=20;break;case 29:case"end":return e.stop()}}),e)})),function(){var t=this,n=arguments;return new Promise((function(o,r){var s=e.apply(t,n);function c(e){i(s,o,r,c,a,"next",e)}function a(e){i(s,o,r,c,a,"throw",e)}c(void 0)}))});return function(){return t.apply(this,arguments)}})()(),d.events.OracleRequest({fromBlock:"latest"},(function(e,t){e&&console.log("oracle request error ",e),console.log("oracle request detected"),console.log("=============="),console.log("event.index ",t.index),console.log("event.airline ",t.airline),console.log("event.flight ",t.flight),console.log("event.timestamp ",t.timestamp)}));var p=l()();p.get("/api",(function(e,t){t.send({message:"An API for use with your Dapp!"})})),t.default=p}};