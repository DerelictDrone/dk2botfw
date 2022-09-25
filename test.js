const udp = require('dgram')
const fs = require('fs')
const sock = udp.createSocket("udp4")

keepalive = Buffer.from("bf03","hex") //maybe keepalive? Host was sending this packet out after a join attempt failed, continuously, OR used to send config, idk
// BF03 has sent:
// Player Names => Lobby fe ff 20 (3 zeroes) 68 (first letter of name)
// Client <= Player Names ff ff 48 (3 zeroes) 6b 02 17 00 (first letter of name)
// Level Names ff ff 1f (3 zeroes) 69 (first letter of name)
// Game config? ff ff 23 01 (2 zeroes) 6f 00 40 25 (see full packet dump)
chat = Buffer.from("bf04","hex")
search = Buffer.from("bf05","hex")
lobby = Buffer.from("bf06","hex")
join = Buffer.from("bf07","hex")
serverack = Buffer.from("bf08","hex") // Possibly an ack from server, sent first before lobby dump
lobbystatus = Buffer.from("bf0b","hex")

keepalivepacket = Buffer.from("bf03000000000000050000006e00000000","hex")
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
Byte 77: Current Players 7 bit number, always +1? (last bit ignored)
Byte 78: Map Byte 1
Byte 79: Max Players BYTE
Byte 81-82: Map Bytes 2 & 3


*/
let joinpacket = fs.readFileSync("join.bin",{encoding: null})
fs.watchFile("join.bin",()=>{
	console.log("join changed")
	lobbypacket = fs.readFileSync("join.bin",{encoding: null})
})

if(process.argv[2] === "host") {
	sock.bind({port: 7575, address: "0.0.0.0"})
} else {
	sock.bind({port: 7576, address: "0.0.0.0"})
}

let intervals = {}

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
		// We need to slice some of the data from the lobby packet and send it back, it seems.
		// Position 16 in lobby two 16 byte sections, Position 16 in join, section order reversed.
		clearInterval(intervals["search"])
		generatedpacket = Buffer.concat([joinpacket.slice(0,16),d.slice(32,48),d.slice(16,32),joinpacket.slice(16+32)])
		sock.send(generatedpacket,rinfo.port,rinfo.address)
		//sentpacket = joinpacket
	} else {
		console.log("Unknown: ",d.slice(0,2))
	}
	if(sentpacket != 0) {
	console.log("sent packet back")
	sock.send(sentpacket,rinfo.port,rinfo.address)
	}
})

if(process.argv[2] != "host") {
	sock.connect(7575,"192.168.68.102",()=>{
		sock.send(searchpacket)
		intervals.search = setInterval(()=>{sock.send(searchpacket)},1000)
	})
}