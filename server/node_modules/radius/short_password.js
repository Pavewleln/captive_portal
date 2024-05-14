// Copyright (c) 2018, RetailNext, Inc.
// This material contains trade secrets and confidential information of
// RetailNext, Inc.  Any use, reproduction, disclosure or dissemination
// is strictly prohibited without the explicit written permission
// of RetailNext, Inc.
// All rights reserved.

var fs = require("fs");
var radius = require("./lib/radius");
var dgram = require('dgram');

var dst_ip = "54.208.19.153";

radius.add_dictionary("/home/psanford/projects/nearbuy/storenet/node/radius/vendor_dictionary");

var client = dgram.createSocket("udp4");
client.bind(49001);


var secret = "XpmyBBATzveRp";

var attrs = [
  ['Vendor-Specific', 14823, [['Aruba-Location-Id', '13:37:13:37:13:37']]],
];
var packet = radius.encode({
  code: 'Accounting-Request',
  identifier: 1,
  attributes: attrs,
  secret: secret
});

fs.writeFileSync("/tmp/pkt.packet", packet);

client.on('message', function(msg, rinfo) {
  var response = radius.decode({packet: msg, secret: secret});
  console.log('got', response);
  client.close();
});
client.send(packet, 0, packet.length, 1813, dst_ip);

//   attrs['User-Password'] = 'beverly-crusher-123';
//   packet = radius.encode({
//     code: 'Access-Request',
//     identifier: 2,
//     attributes: attrs,
//     secret: secret
//   });

//   fs.writeFileSync("/tmp/long_password.packet", packet);
//   client.send(packet, 0, packet.length, 1812, dst_ip, function() {
//     client.close();
//   });
// });
