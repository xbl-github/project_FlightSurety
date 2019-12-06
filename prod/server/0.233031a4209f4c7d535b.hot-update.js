exports.id=0,exports.modules={"./src/server/server.js":function(e,r,t){"use strict";t.r(r);var n=t("./build/contracts/FlightSuretyApp.json"),o=t("./src/server/config.json"),s=t("web3"),c=t.n(s),a=t("express"),u=t.n(a);function i(e,r,t,n,o,s,c){try{var a=e[s](c),u=a.value}catch(e){return void t(e)}a.done?r(u):Promise.resolve(u).then(n,o)}var l=o.localhost,p=new c.a(new c.a.providers.WebsocketProvider(l.url.replace("http","ws")));p.eth.defaultAccount=p.eth.accounts[0];var v=new p.eth.Contract(n.abi,l.appAddress);(function(){var e,r=(e=regeneratorRuntime.mark((function e(){var r,t;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("register oracles"),e.next=3,p.eth.getAccounts();case 3:for((r=e.sent).length,t=0;t<r.length;t++)console.log("i ",t," star - i ",star-t," accounts ",r[star-t]);case 6:case"end":return e.stop()}}),e)})),function(){var r=this,t=arguments;return new Promise((function(n,o){var s=e.apply(r,t);function c(e){i(s,n,o,c,a,"next",e)}function a(e){i(s,n,o,c,a,"throw",e)}c(void 0)}))});return function(){return r.apply(this,arguments)}})()(),v.events.OracleRequest({fromBlock:"latest"},(function(e,r){e&&console.log(e),console.log(r)}));var f=u()();f.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})})),r.default=f}};