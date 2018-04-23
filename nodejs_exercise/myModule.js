'use strict';
var hdb = require("hdb");
var async = require("async");
var options = {
	host: "10.129.126.241",
	port: "30171",
	user: "BIZX",
	password: "Pass1234"
};

module.exports = {
	sayHello: function(){
		return "Hello myModule";
	},
	callHANA: function(cb){
		var client = hdb.createClient(options);
		client.connect(function(cb){
			console.log("db connected");
			//SYS.M_SYSTEM_OVERVIEW
			client.exec('select * from SYS.M_SYSTEM_OVERVIEW',
			function(err, res, cb){
				if(err){
					console.error(err);
					return ("error:"+err);
				}
				console.log("db call complete");
				for(var i=0;i<res.length;i++){
					console.log(res[i].NAME+":"+res[i].VALUE+"\n");
				}
				client.disconnect(function(cb){
					console.log("db disconnected");
				});

				async.parallel([
					function(){console.error('11111111111');},
					function(){console.error('22222222222');},
					function(){console.error('33333333333');},
					function(){console.error('44444444444');}
				],function(err){
					setTimeout(function(){
						console.error("done............");
						process.exit();
					}, 100);
				});
			})
		});
		//cb();
	}
}
