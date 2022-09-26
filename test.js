const udp = require('dgram')
const fs = require('fs')
const sock = udp.createSocket("udp4")


playerintroduction = Buffer.from("bf01","hex") // Server => Client information on another player... I think.
keepalive = Buffer.from("bf03","hex") //maybe keepalive? Host was sending this packet out after a join attempt failed, continuously, OR used to send config, idk
// BF03 has sent:
// Player Names => Host fe ff 20 (3 zeroes) 68 (first letter of name)
// Client <= Player Names ff ff 48 (3 zeroes) 6b 02 17 00 (first letter of name)
// Level Names ff ff 1f (3 zeroes) 69 (first letter of name)
// Game config? ff ff 23 01 (2 zeroes) 6f 00 40 25 (see full packet dump)
chat = Buffer.from("bf04","hex")
// Byte 5 = Player(00 = Red Keeper 01 = Blue Keeper etc. etc. 04 = Pink Keeper/System Message? 05 and up = Invisible to default client, still relayed by server.)
// Byte 9 = String Length, Starts at 06, math for calculating length is (strlen*2)+6
// Byte 15 = String Beginning(each character has one null character between)
// Last 2 bytes after string are null characters, I.E one extra, empty space to terminate.
search = Buffer.from("bf05","hex")
lobby = Buffer.from("bf06","hex")
join = Buffer.from("bf07","hex")
serverack = Buffer.from("bf08","hex") // Possibly an ack from server, sent first before lobby dump
// Server Ack contains a unique identifier for client, which is later used in disconnects and maybe other stuff too.
// UID Appears to be between 32 and 52 bytes long.
serverdisconnect = Buffer.from("bf09","hex") // Server => Client notification of disconnect I think, sent from server to client after any client disconnects or if lobby closed.
goodbye = Buffer.from("bf0a","hex") // Client => Server notification of disconnect I think
//UID Starts at byte 45 or so.
lobbystatus = Buffer.from("bf0b","hex")
variablebox = Buffer.from("bf0c","hex") // I think this contains the creature settings and stuff under the lobby settings, I can't be sure though.
lobbyclose = Buffer.from("bf0f","hex") // Sent when lobby closed, I think..

keepalivepacket = Buffer.from("bf03000000000000050000006e00000000","hex")
let keepaliveclientpacket = fs.readFileSync("keepalive_client.bin",{encoding: null})
fs.watchFile("keepalive_client.bin",()=>{
	console.log("keepalive changed")
keepaliveclientpacket = fs.readFileSync("keepalive_client.bin",{encoding: null})
})
searchpacket = Buffer.from("bf05190020c8a200a0175a08a0f6b578ec6bd1118c5700a0c993f0c6","hex")
let lobbypacket = fs.readFileSync("lobby.bin",{encoding: null})
fs.watchFile("lobby.bin",()=>{
	console.log("lobby changed")
	lobbypacket = fs.readFileSync("lobby.bin",{encoding: null})
})
// Lobby packet layout:
/*
Byte 1-2: Packet Type
Byte 12 and 15: Version, Digits reversed(minor first, major second), major 0 = Demo
Byte 16-48: Lobby Identifier, For join requests this must be sent back with the two 16 byte sections reversed in order.
Byte 77: Current Players 7 bit number, always +1? (last bit ignored)
Byte 78: Map Byte 1
Byte 79: Max Players Byte
Byte 81-82: Map Bytes 2 & 3


*/
let joinpacket = fs.readFileSync("join.bin",{encoding: null})
fs.watchFile("join.bin",()=>{
	console.log("join changed")
	lobbypacket = fs.readFileSync("join.bin",{encoding: null})
})

let messagepacket = fs.readFileSync("message.bin",{encoding: null})

if(process.argv[2] === "host") {
	sock.bind({port: 7575, address: "0.0.0.0"})
} else {
	sock.bind({port: 7576, address: "0.0.0.0"})
}

let disconnectpacket = fs.readFileSync("disconnect.bin",{encoding: null})

let intervals = {}
let clientState = {} // UID presently

function formMessagePacket(string,keeperID = 0) {
	string = string.toString() // Sanity check, put raw buffers in here too if you want.
	const message = messagepacket.slice(0,15)
	message[4] = keeperID // Be sure to set this to YOUR OWN KEEPER ID!
	message[8] = (string.length * 2) + 6 // Game is vulnerable to heartbleed btw, do NOT fuck this offset up.
	string = "\0" + string.split("").join("\0") + "\0\0"
	return Buffer.concat([message,Buffer.from(string)])
}

sock.on('message',(d,rinfo)=>{
	console.log("PING!!")
	let sentpacket = 0
	identifier = d.slice(0,2).toString()
	if(identifier === keepalive.toString()) {
		console.log("KeepAlive/Update")
	} else if(identifier === lobbystatus.toString()) {
		console.log("Lobby Dump")
	} else if(identifier === search.toString()) {
		console.log("Search")
		sentpacket = lobbypacket
	} else if(identifier === join.toString()) {
		console.log("Join attempt incoming")
		// In this event, we need to send a few different types of packets under bf03
		// Lobby Dump (where it presumably has the variables, player names, and the level's proper name)
		sentpacket = keepalivepacket
	} else if(identifier === lobby.toString()) {
		console.log("Found Lobby:"+d.slice(112,112+32).toString("ascii"))
		// Here we need to send a join packet and receive the lobby dump, then begin updating on our status, continuously.
		clearInterval(intervals["search"])
		generatedpacket = Buffer.concat([joinpacket.slice(0,16),d.slice(32,48),d.slice(16,32),joinpacket.slice(16+32)])
		// join packet
		sock.send(generatedpacket,rinfo.port,rinfo.address)
		// Name updates don't appear to be enough to keep server up, but does appear to allow players to see you in the lobby.
		//sentpacket = joinpacket
	} else if(identifier === serverack.toString()) {
		console.log("ServerAck")
		// Take our UID from the serverack at position 16 and paste it for dc message at 43 and maybe other locations too
		// UID is 16 bytes long
		// POSSIBLY 52 BYTES LONG
		clientState.UID = d.slice(16,16+52)
		intervals['name_heartbeat'] = setInterval(()=>{sock.send(keepaliveclientpacket,rinfo.port,rinfo.address),2000})
		setTimeout(()=>{
			sock.send(formMessagePacket("Hello World!",1))
			setTimeout(()=>{
				formedpacket = Buffer.concat([disconnectpacket.slice(0,45),clientState.UID])
				sock.send(formedpacket)
			},1000)
		},5000)
	} else if (identifier === serverdisconnect.toString()) {
		console.log("Disconnect(Server)")
		clearInterval(intervals["name_heartbeat"])
	} else if(identifier === lobbyclose.toString()) {
		console.log("Lobby Closed")
	}else {
		console.log("Unknown: ",d.slice(0,2))
	}
	if(sentpacket != 0) {
	console.log("sent packet back")
	sock.send(sentpacket,rinfo.port,rinfo.address)
	}
})

process.stdin.on('data',(d)=>{
sock.send(formMessagePacket(d,1))
})

if(process.argv[2] != "host") {
	sock.connect(7575,"127.0.0.1",()=>{
		sock.send(searchpacket)
		intervals.search = setInterval(()=>{sock.send(searchpacket)},1000)
	})
}