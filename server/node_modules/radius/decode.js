// Copyright (c) 2018, RetailNext, Inc.
// This material contains trade secrets and confidential information of
// RetailNext, Inc.  Any use, reproduction, disclosure or dissemination
// is strictly prohibited without the explicit written permission
// of RetailNext, Inc.
// All rights reserved.



var fs = require("fs");
var radius = require("./lib/radius");
var dgram = require('dgram');



var p = fs.readFileSync("/tmp/naughty_packet");


var packet = p;
// var decoded = radius.decode({packet: p, secret: ''});


var client = dgram.createSocket("udp4");
client.bind(49001);


client.send(packet, 0, packet.length, 1812, '127.0.0.1', function() {
  console.log("done!");
});
