exports.id=0,exports.modules={"./src/server/server.js":function(e,t,r){"use strict";r.r(t);var n=r("./build/contracts/FlightSuretyApp.json"),o=r("./src/server/config.json"),s=r("web3"),c=r.n(s),a=r("express"),u=r.n(a);function i(e,t,r,n,o,s,c){try{var a=e[s](c),u=a.value}catch(e){return void r(e)}a.done?t(u):Promise.resolve(u).then(n,o)}var l=o.localhost,p=new c.a(new c.a.providers.WebsocketProvider(l.url.replace("http","ws")));p.eth.defaultAccount=p.eth.accounts[0];var v=new p.eth.Contract(n.abi,l.appAddress),f=p.utils.toWei("1","ether"),h=[];(function(){var e,t=(e=regeneratorRuntime.mark((function e(){var t,r,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("register oracles"),e.next=3,p.eth.getAccounts();case 3:t=e.sent,r=t.length-1,n=0;case 6:if(!(n<30)){e.next=14;break}return console.log("i ",n," start - i ",r-n," accounts ",t[r-n]),e.next=10,v.methods.registerOracle().send({from:t[r-n],value:f});case 10:h.push(t[r-n]);case 11:n++,e.next=6;break;case 14:case"end":return e.stop()}}),e)})),function(){var t=this,r=arguments;return new Promise((function(n,o){var s=e.apply(t,r);function c(e){i(s,n,o,c,a,"next",e)}function a(e){i(s,n,o,c,a,"throw",e)}c(void 0)}))});return function(){return t.apply(this,arguments)}})()(),v.events.OracleRequest({fromBlock:"latest"},(function(e,t){e&&console.log(e),console.log(t)}));var d=u()();d.get("/api",(function(e,t){t.send({message:"An API for use with your Dapp!"})})),t.default=d}};