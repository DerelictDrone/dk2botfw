const KwdHeaders = require('./kwd reader/header.js')
const DK2Door = require('./kwd reader/doors.js')
const {DK2KeeperSpell} = require('./kwd reader/keeperspells.js')
const fs = require('fs')

function kwdReader() {
	const kwd = fs.openSync('KeeperSpells.kwd')
	x = Buffer.allocUnsafe(56)
	fs.readSync(kwd,x)
	firstDoor = Buffer.allocUnsafe(800)
	fs.readSync(kwd,firstDoor)
	// console.log(new KwdHeaders.KWDGenericHeader(x))
	console.log(new DK2KeeperSpell(firstDoor))
	fs.readSync(kwd,firstDoor)
	console.log(new DK2Door.DK2Door(firstDoor))
}

function kwdDump() {
	const kwd = fs.openSync('KeeperSpells.kwd')
	const header = Buffer.allocUnsafe(56)
	fs.readSync(kwd,header);
	const headerParsed = new KwdHeaders.KWDGenericHeader(header)
	const itemBuffer = Buffer.allocUnsafe(DK2KeeperSpell.size)
	for(let i = 0; i < headerParsed.ItemCount; i++) {
		fs.readSync(kwd,itemBuffer)
		fs.appendFileSync('dump.json',JSON.stringify(new DK2KeeperSpell(itemBuffer)))
	}
}

// kwdReader()
kwdDump()