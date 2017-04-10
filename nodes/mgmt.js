var RED = require(process.env.NODE_RED_HOME + "/red/red");
var util = require("util");
var iot = require('iot-nodejs');
// var connectionPool = require(process.env.NODE_RED_HOME
// 	+ "/nodes/core/io/lib/mqttConnectionPool");

var macAddress;
var clients = {};
var nodes = {};

var getClient = function (url, id) {
	if (!nodes[url]) {
		nodes[url] = [id];
	}
	else if (nodes[url].indexOf(id) < 0) {
		removeNode(id);
		nodes[url].push(id);
	}
	let node = RED.nodes.getNode(id);
	if ((url in clients)) {
		if (node) node.log('found existing client.');
		console.log('found existing client.');
	}
	else {
		clients[url] = new iot.application({url: url});
		clients[url].connect(1, () => {
			if (node) node.log('[' + id + '] ' + url);
			console.log('[' + id + '] ' + url);
		});
	}
	return clients[url];
}

var removeClient = function (url) {
	if (clients[url]) {
		client[url].disconnect();
		delete clients[url];
	}
}

var removeNode = function (id) {
	Object.keys(nodes).map(url => {
		let idx = nodes[url].indexOf(id);
		if (idx > -1) {
			nodes[url].splice(idx);
		}
		if (nodes[url].length < 1) {
			delete nodes[url];
			removeClient(url);
		}
	});
}

require('getmac').getMac(function (err, mac) {
	if (err) {
		console.error("getmac module not installed. Please install by 'npm install getmac'");
		throw err;
	}
	macAddress = mac.toLowerCase().replace(/-/g, "").replace(/:/g, "");

	// var DEVICE_PUBLISH_TOPIC = "iot-2/evt/status/fmt/json";
	// var QUICKSTART_HOST = "quickstart.messaging.internetofthings.ibmcloud.com";
	// var REGIS_HOST = "messaging.internetofthings.ibmcloud.com";

	// function setupConnection(node, config) {

	// 	var clientId;

	// 	util.log("[iot-dev] The connect mode is " + config.connectmode);
	// 	if (config.connectmode == "qsmode") {
	// 		// Quickstart Mode
	// 		node.brokerHost = QUICKSTART_HOST;
	// 		node.brokerPort = "1883";

	// 		node.organization = "quickstart";	// Hardcoding to Quickstart
	// 		node.typeId = config.deviceType || "iotsample-nodered";
	// 		node.deviceId = config.deviceId || macAddress;

	// 		util.log("[iot-dev] Connecting to host : " + node.brokerHost + " port : " + node.brokerPort);

	// 		clientId = "d:" + node.organization + ":" + node.typeId + ":"
	// 			+ node.deviceId;
	// 		util.log("[iot-dev] with client ID : " + clientId);
	// 		node.client = connectionPool.get(node.brokerHost, node.brokerPort,
	// 			clientId, null, null);

	// 	} else {
	// 		//Registered Mode
	// 		node.brokerHost = config.orgId + "." + REGIS_HOST;
	// 		node.brokerPort = "1883";

	// 		node.organization = config.orgId;
	// 		node.typeId = config.deviceType || "iotsample-nodered";
	// 		node.deviceId = config.deviceId || macAddress;

	// 		//Auth
	// 		node.authMethod = "use-token-auth";	//Hardcording it now
	// 		node.authToken = config.authToken;

	// 		util.log("[iot-dev] Connecting to host : " + node.brokerHost + " port : " + node.brokerPort + " using the Auth-Token");

	// 		clientId = "d:" + node.organization + ":" + node.typeId + ":"
	// 			+ node.deviceId;
	// 		util.log("[iot-dev] with client ID : " + clientId);
	// 		node.client = connectionPool.get(node.brokerHost, node.brokerPort,
	// 			clientId, node.authMethod, node.authToken);

	// 	}

	// 	node.client.connect();


	// 	node.on("close", function () {
	// 		if (node.client) {
	// 			node.client.disconnect();
	// 		}
	// 	});
	// }

	function setupConnection (node, config) {
		let client = getClient(config.url, config.id);
		node.on("close", function () {
			removeClient(config.id);
		});
	}

	// function IotDevInNode(n) {
	// 	RED.nodes.createNode(this, n);
	// 	setupConnection(this, n);

	// 	var command = n.command || "+";
	// 	var format = n.format || "+";

	// 	var topic = "";

	// 	topic = "iot-2/cmd/" + command + "/fmt/" + format;

	// 	util.log("[Dev-In] Subscribing to topic : " + topic);

	// 	var that = this;
	// 	if (topic) {
	// 		this.client.subscribe(topic, 0, function (topic1, payload, qos,
	// 			retain) {
	// 			util.log("[Dev-In] Received MQTT message: " + payload);
	// 			//extract the command and pass it on.
	// 			var tokens = topic1.split("/");
	// 			var commandTopic = tokens[2];
	// 			util.log("[Dev-In] Received command: " + commandTopic);
	// 			// if topic string ends in "json" attempt to parse. If fails, just
	// 			// pass through as string.
	// 			// if topic string ends in anything other than "json" just pass
	// 			// through as string.
	// 			var parsedPayload = "";
	// 			if (/json$/.test(topic1)) {
	// 				try {
	// 					parsedPayload = JSON.parse(payload);
	// 				} catch (err) {
	// 					parsedPayload = payload;
	// 				}
	// 			} else {
	// 				parsedPayload = payload;
	// 			}

	// 			var msg = {
	// 				"topic": topic1,
	// 				"command": commandTopic,
	// 				"payload": parsedPayload
	// 			};
	// 			that.send(msg);
	// 		});
	// 	}
	// }

	// RED.nodes.registerType("iot-dev-in", IotDevInNode);

	// function IotDevOutNode(n) {
	// 	RED.nodes.createNode(this, n);

	// 	// based on QS or Regis mode, setup connection
	// 	setupConnection(this, n);

	// 	this.on("input", function (msg) {
	// 		util.log("[Dev-Out] Message : " + msg.payload);

	// 		msg.topic = DEVICE_PUBLISH_TOPIC;

	// 		this.client.publish(msg);

	// 	});
	// }

	// RED.nodes.registerType("iot-dev-out", IotDevOutNode);


	function IotManagementNode(config) {
		RED.nodes.createNode(this, config);

		let clientNode = RED.nodes.getNode(config.client);
		if (clientNode) {

			this.client = config.client;

			if (clientNode.isConnected) {
				this.status({fill:"green",shape:"dot",text:"node-red:common.status.connected"});
			}
			else {
				this.status({fill:"red",shape:"ring",text:"node-red:common.status.disconnected"});
			}

			clientNode.register(this);

			this.on("input", msg => {
				util.log("[IotManagement] Message : " + msg.payload);
			});

			this.on('close', done => clientNode.deregister(this, done));
		}

		console.log(JSON.stringify(this, null, ' '));
		console.log(JSON.stringify(config, null, ' '));
	}

	RED.nodes.registerType("iot-mgmt", IotManagementNode);


	function IotClientNode(config) {
		RED.nodes.createNode(this, config);

		// Define functions called by app and dev nodes
		this.users = {};
		this.connecting = false;
		this.connected = false;
		this.closing = false;

		this.register = (node) => {
			this.users[node.id] = node;
			if (Object.keys(this.users).length === 1) {
				this.connect();
			}
		};

		this.deregister = (node, done) => {
			delete this.users[node.id];
			if (this.closing) {
				return done();
			}
			if (Object.keys(this.users).length === 0) {
				if (this.client && this.client.connected) {
					return this.client.end(done);
				}
				else {
					this.client.end();
					return done();
				}
			}
			done();
		};

		this.connect = () => {
			if (!this.client) {
				this.client = new iot.application({url: config.url});
			}
			if (!this.client.connected) {
				this.client.connect(1, () => {
					this.connected = true;
					Object.keys(this.users).forEach(id =>
						RED.nodes.getNode(id).status({
							fill:"green",
							shape:"dot",
							text:"node-red:common.status.connected"
						})
					);
				});
			}
		}

		this.on('close', function (done) {
			this.closing = true;
			if (this.connected || this.connecting) {
				this.client.disconnect();
			}
			done();
		});
	}

	RED.nodes.registerType("iot-client", IotClientNode);

	RED.httpAdmin.get('/iot/mgmt', function (req, resp) {
		let clientNodeId = RED.nodes.getNode(req.query.id).client;
		let client = RED.nodes.getNode(clientNodeId).client;
		if (req.query.method) {
			client[req.query.method].apply(client, req.query.arguments).then((res) => {
				console.log(res);
				resp.status(200).send(res);
			}).catch(rej => {
				resp.status(404).send(rej);
			})
		}
		else {
			let fre = /^([^(]+)\(([^)]*)\)/;
			let exclude = ['constructor', 'connect', 'callApi', 'publishHTTPS'];
			let methods = Reflect.ownKeys(Reflect.getPrototypeOf(client)).filter(
				key => exclude.indexOf(key) < 0 && client[key] instanceof Function
			).sort();
			methods = methods.map(key => {
			let tmp = fre.exec(client[key].toString());
			return {
				name: key,
				signature: tmp[2].split(',').map(e => e.trim()).filter(e => e).map(e => {return {name: e.trim(), type: 'text'};})
			}});
			resp.status(200).send(methods);
		}
	});

});