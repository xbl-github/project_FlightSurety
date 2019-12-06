exports.id=0,exports.modules={"./src/server/server.js":function(e,t,r){"use strict";r.r(t);var n=r("./build/contracts/FlightSuretyApp.json"),o=r("./src/server/config.json"),s=r("web3"),c=r.n(s),a=r("express"),u=r.n(a);function i(e,t,r,n,o,s,c){try{var a=e[s](c),u=a.value}catch(e){return void r(e)}a.done?t(u):Promise.resolve(u).then(n,o)}var l=o.localhost,d=new c.a(new c.a.providers.WebsocketProvider(l.url.replace("http","ws")));d.eth.defaultAccount=d.eth.accounts[0];var g=new d.eth.Contract(n.abi,l.appAddress),f=d.utils.toWei("1","ether"),p=[];(function(){var e,t=(e=regeneratorRuntime.mark((function e(){var t,r,n,o,s;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("register oracles"),e.next=3,d.eth.getAccounts();case 3:t=e.sent,r=t.length-1,n=0;case 6:if(!(n<30)){e.next=19;break}return console.log("i ",n," start - i ",r-n," accounts ",t[r-n]),e.next=10,g.methods.registerOracle({from:t[r-n],value:f,gas:66e5,gasPrice:1e5});case 10:return e.next=12,g.methods.getMyIndexes({from:t[r-n]});case 12:o=e.sent,console.log("Oracle Registered ".concat(n,":  ").concat(o[0],", ").concat(o[1],", ").concat(o[2])),p.push(t[r-n]),console.log("---");case 16:n++,e.next=6;break;case 19:n=0;case 20:if(!(n<30)){e.next=29;break}return console.log(" oracle ",n," address ",p[n]),e.next=24,g.methods.getMyIndexes({from:p[n]});case 24:s=e.sent,console.log("Oracle Registered ".concat(n,":  ").concat(s[0],", ").concat(s[1],", ").concat(s[2]));case 26:n++,e.next=20;break;case 29:case"end":return e.stop()}}),e)})),function(){var t=this,r=arguments;return new Promise((function(n,o){var s=e.apply(t,r);function c(e){i(s,n,o,c,a,"next",e)}function a(e){i(s,n,o,c,a,"throw",e)}c(void 0)}))});return function(){return t.apply(this,arguments)}})()(),g.events.OracleRequest({fromBlock:"latest"},(function(e,t){e&&console.log(e),console.log("oracle request detected")}));var v=u()();v.get("/api",(function(e,t){t.send({message:"An API for use with your Dapp!"})})),t.default=v}};