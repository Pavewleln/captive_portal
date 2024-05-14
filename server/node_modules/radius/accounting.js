// Copyright (c) 2018, RetailNext, Inc.
// This material contains trade secrets and confidential information of
// RetailNext, Inc.  Any use, reproduction, disclosure or dissemination
// is strictly prohibited without the explicit written permission
// of RetailNext, Inc.
// All rights reserved.


var fs = require("fs");
var radius = require("./lib/radius");
var dgram = require('dgram');

var dst_ip = "127.0.0.1";

var client = dgram.createSocket("udp4");
client.bind(49001);

var secret = "secret";

var attrs = {
  'User-Name': 'jlpicard',
  'User-Password': 'beverly',
  'Service-Type': 'Login-User',
  'NAS-IP-Address': '169.134.68.136'
};
var packet = radius.encode({
  code: 'Access-Request',
  identifier: 1,
  attributes: attrs,
  secret: secret
});

fs.writeFileSync("/tmp/short_password.packet", packet);

client.send(packet, 0, packet.length, 1812, dst_ip, function() {
  attrs['User-Password'] = 'beverly-crusher-123';
  packet = radius.encode({
    code: 'Access-Request',
    identifier: 2,
    attributes: attrs,
    secret: secret
  });

  fs.writeFileSync("/tmp/long_password.packet", packet);
  client.send(packet, 0, packet.length, 1812, dst_ip, function() {
    client.close();
  });
});
