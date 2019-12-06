exports.id=0,exports.modules={"./src/server/server.js":function(e,t,r){"use strict";r.r(t);var n=r("./build/contracts/FlightSuretyApp.json"),o=r("./src/server/config.json"),s=r("web3"),c=r.n(s),a=r("express"),i=r.n(a);function u(e,t,r,n,o,s,c){try{var a=e[s](c),i=a.value}catch(e){return void r(e)}a.done?t(i):Promise.resolve(i).then(n,o)}var l=o.localhost,f=new c.a(new c.a.providers.WebsocketProvider(l.url.replace("http","ws")));f.eth.defaultAccount=f.eth.accounts[0];var g=new f.eth.Contract(n.abi,l.appAddress),p=f.utils.toWei("1","ether"),v=[];(function(){var e,t=(e=regeneratorRuntime.mark((function e(){var t,r,n,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("register oracles"),e.next=3,f.eth.getAccounts();case 3:t=e.sent,r=t.length-1,n=0;case 6:if(!(n<30)){e.next=15;break}return console.log("i ",n," start - i ",r-n," accounts ",t[r-n]),e.next=10,g.methods.registerOracle({from:t[r-n],value:p,gas:66e5,gasPrice:1e5});case 10:v.push(t[r-n]),console.log("---");case 12:n++,e.next=6;break;case 15:n=0;case 16:if(!(n<30)){e.next=25;break}return console.log(" oracle ",n," address ",v[n]),e.next=20,g.methods.getMyIndexes.call({from:v[n]});case 20:o=e.sent,console.log("Oracle Registered ".concat(n,":  ").concat(o[0],", ").concat(o[1],", ").concat(o[2]));case 22:n++,e.next=16;break;case 25:case"end":return e.stop()}}),e)})),function(){var t=this,r=arguments;return new Promise((function(n,o){var s=e.apply(t,r);function c(e){u(s,n,o,c,a,"next",e)}function a(e){u(s,n,o,c,a,"throw",e)}c(void 0)}))});return function(){return t.apply(this,arguments)}})()(),g.events.OracleRequest({fromBlock:"latest"},(function(e,t){e&&console.log(e),console.log(t)}));var d=i()();d.get("/api",(function(e,t){t.send({message:"An API for use with your Dapp!"})})),t.default=d}};