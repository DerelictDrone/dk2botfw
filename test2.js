const KwdHeaders = require('./kwd reader/header.js')
const {DK2Creature} = require('./kwd reader/creature.js')
const {DK2Door} = require('./kwd reader/doors.js')
const {DK2KeeperSpell} = require('./kwd reader/keeperspells.js')
const fs = require('fs')

const kwdFile = "Creatures.kwd"
const ItemSize = 5449
const ItemType = DK2Creature

function kwdReader() {
	const kwd = fs.openSync(kwdFile)
	header = Buffer.allocUnsafe(56)
	fs.readSync(kwd,header)
	// Item = Buffer.allocUnsafe(ItemSize)
	// fs.readSync(kwd,Item)
	console.log(new KwdHeaders.KWDGenericHeader(header).DateModified)
	// console.log(new ItemType(Item))
	// fs.readSync(kwd,Item)
	// console.log(new ItemType(Item))
}

function kwdDump() {
	const kwd = fs.openSync(kwdFile)
	const header = Buffer.allocUnsafe(56)
	fs.readSync(kwd,header);
	const headerParsed = new KwdHeaders.KWDGenericHeader(header)
	const itemBuffer = Buffer.allocUnsafe(ItemSize)
	for(let i = 0; i < headerParsed.ItemCount; i++) {
		fs.readSync(kwd,itemBuffer)
		fs.appendFileSync('dump.json',JSON.stringify(new ItemType(itemBuffer)))
	}
}

kwdReader()
// kwdDump()