"use strict";
var http = require('http');
var opn = require('opn');
var express = require('express');
var myModule = require('./myModule');
var PORT = process.env.PORT || 3000;

process.title = 'node-chat';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
var app = express();
//Hello Route
app.route('/hello')
	.get(function(req, res){
		res.send('Hello World');
		http.get({
			path:'http://www.loc.gov/pictures/search/?fo=json&q=SAP',
			host:'proxy.sin.sap.corp',
			port:'8080',
			headers:{
				host:'www.loc.gov'
			}
		},function(resp){
			resp.setEncoding('utf-8');
			resp.on('data',function(data){console.log(data.substring(0,100))});
			resp.on('error',console.error);
		});
	});
app.use('/',express.static(__dirname + '/html'));
app.route('/sayHello')
	.get(function(req, res){
		res.send(myModule.sayHello());
	});
app.route('/callHANA')
	.get(function(req, res){
		res.send(myModule.callHANA());
	});
app.route('/dalembert')
    .get(function(req, res){
        //res.send(myModule.callD_alembert(req, res));
        myModule.callD_alembert(req, res);
    });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


// http.createServer(function(req, res){
// 	res.end('Hello World\n');
// }).listen(3000, '127.0.0.1');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// start the server
var server = app.listen(PORT, function(){
	console.log('Server running');
	//opn('http://127.0.0.1:3000/chat.html');
    //opn('http://127.0.0.1:3000/dalembert');
});


var WebSocketServer = require('websocket').server;
var wsServer = new WebSocketServer({
  httpServer: server
});


// WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);
                
                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});



