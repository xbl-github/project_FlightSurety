exports.id=0,exports.modules={"./src/server/server.js":function(e,r,n){"use strict";n.r(r);var t=n("./build/contracts/FlightSuretyApp.json"),o=n("./src/server/config.json"),s=n("web3"),l=n.n(s),a=n("express"),c=n.n(a);function u(e,r,n,t,o,s,l){try{var a=e[s](l),c=a.value}catch(e){return void n(e)}a.done?r(c):Promise.resolve(c).then(t,o)}var i=o.localhost,g=new l.a(new l.a.providers.WebsocketProvider(i.url.replace("http","ws"))),v=new g.eth.Contract(t.abi,i.appAddress),h=g.utils.toWei("1","ether"),p=[];g.eth.getAccounts((function(e,r){console.log("web3.eth.getAccounts"),console.log("accounts.length ",r.length);for(var n=r.length-1,t=0;t<20;t++){try{console.log("registering oracle"),v.methods.registerOracle().send({from:r[n],value:h,gas:66e5})}catch(e){console.log("error registering oracles ",e)}console.log("i ",t," accounts[i] ",r[t]," j ",n," accounts[j] ",r[n]),p.push(r[n]),n--}})),v.events.OracleRequest({fromBlock:"latest"},function(){var e,r=(e=regeneratorRuntime.mark((function e(r,n){var t,o,s,l,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r&&console.log(r),console.log("------------------------------------------------"),console.log("*** event detected *** "),console.log(" event.returnValues.index     ",n.returnValues.index),console.log(" event.returnValues.airline   ",n.returnValues.airline),console.log(" event.returnValues.flight    ",n.returnValues.flight),console.log(" event.returnValues.timestamp ",n.returnValues.timestamp),console.log(" oracles.length ",p.length),t=n.returnValues.index,o=n.returnValues.airline,s=n.returnValues.flight,l=n.returnValues.timestamp,a=0;case 13:if(!(a<20)){e.next=29;break}return console.log(" ++++++++++++++++ "),console.log(" ask oracle i= ",a),e.prev=17,e.next=20,v.methods.submitOracleResponse(t,o,s,l,20).send({from:p[a],gas:6666666});case 20:e.next=25;break;case 22:e.prev=22,e.t0=e.catch(17),console.log("error");case 25:console.log(" -----------------");case 26:a++,e.next=13;break;case 29:console.log("---------------END FOR LOOP ---------------------------------");case 30:case"end":return e.stop()}}),e,null,[[17,22]])})),function(){var r=this,n=arguments;return new Promise((function(t,o){var s=e.apply(r,n);function l(e){u(s,t,o,l,a,"next",e)}function a(e){u(s,t,o,l,a,"throw",e)}l(void 0)}))});return function(e,n){return r.apply(this,arguments)}}());var f=c()();f.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})})),r.default=f}};