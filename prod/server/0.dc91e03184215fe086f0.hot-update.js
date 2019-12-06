exports.id=0,exports.modules={"./src/server/server.js":function(e,r,t){"use strict";t.r(r);var n=t("./build/contracts/FlightSuretyApp.json"),o=t("./src/server/config.json"),s=t("web3"),c=t.n(s),a=t("express"),u=t.n(a);function l(e,r,t,n,o,s,c){try{var a=e[s](c),u=a.value}catch(e){return void t(e)}a.done?r(u):Promise.resolve(u).then(n,o)}function i(e){return function(){var r=this,t=arguments;return new Promise((function(n,o){var s=e.apply(r,t);function c(e){l(s,n,o,c,a,"next",e)}function a(e){l(s,n,o,c,a,"throw",e)}c(void 0)}))}}var p=o.localhost,f=new c.a(new c.a.providers.WebsocketProvider(p.url.replace("http","ws")));f.eth.defaultAccount=f.eth.accounts[0];var g=new f.eth.Contract(n.abi,p.appAddress),d=f.utils.toWei("1","ether"),v=[];(function(){var e=i(regeneratorRuntime.mark((function e(){var r,t,n,o,s;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("register oracles"),e.next=3,f.eth.getAccounts();case 3:r=e.sent,t=r.length-1,n=0;case 6:if(!(n<30)){e.next=19;break}return console.log("i ",n," start - i ",t-n," accounts ",r[t-n]),e.next=10,g.methods.registerOracle({from:r[t-n],value:d,gas:66e5,gasPrice:1e5});case 10:return e.next=12,g.methods.getMyIndexes({from:r[t-n]});case 12:o=e.sent,console.log("Oracle Registered ".concat(n,":  ").concat(o[0],", ").concat(o[1],", ").concat(o[2])),v.push(r[t-n]),console.log("---");case 16:n++,e.next=6;break;case 19:n=0;case 20:if(!(n<30)){e.next=29;break}return console.log(" oracle ",n," address ",v[n]),e.next=24,g.methods.getMyIndexes({from:v[n]});case 24:s=e.sent,console.log("Oracle Registered ".concat(n,":  ").concat(s[0],", ").concat(s[1],", ").concat(s[2]));case 26:n++,e.next=20;break;case 29:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}})()(),g.events.OracleRequest({fromBlock:"latest"},function(){var e=i(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r&&console.log("oracle request error ",r),console.log("oracle request detected EDIT **"),n=0;case 3:if(!(n<v.length)){e.next=16;break}return e.prev=4,e.next=7,g.methods.submitOracleResponse(t.returnValues.index,t.returnValues.airline,t.returnValues.flight,t.returnValues.timestamp.toNumber(),20,{from:v[n]});case 7:e.next=12;break;case 9:e.prev=9,e.t0=e.catch(4),console.log("oracle response error ",e.t0);case 12:console.log("i ",n);case 13:n++,e.next=3;break;case 16:console.log("done oracle response");case 17:case"end":return e.stop()}}),e,null,[[4,9]])})));return function(r,t){return e.apply(this,arguments)}}()),g.events.OracleReport({fromBlock:"latest"},function(){var e=i(regeneratorRuntime.mark((function e(r,t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r&&console.log(r),console.log("oracle report event detected"),console.log(t);case 3:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}());var h=u()();h.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})})),r.default=h}};