const util = require('util')

class DK2String extends String {
	constructor(buffer,length = 32,offset = 0) {
		const PadLength = length
		const UnpaddedString = buffer.slice(offset,PadLength+offset).toString().split('\0')[0]
		super(UnpaddedString)
		this.PadLength = PadLength
		this.UnpaddedString = UnpaddedString
		this.PaddedString = buffer.slice(0,length).toString()
	}
	getPaddedString() {
		const charsneeded = (this.PadLength-this.length)
		const buffer = Buffer.allocUnsafe(charsneeded)
		buffer.fill(0)
		console.log(charsneeded,buffer,this.PaddedString)
		this.PaddedString = this+buffer.toString()
		return this.PaddedString
	}
	[util.inspect.custom](depth, opts) {
		return this.UnpaddedString
	}
}

class DK2Float extends Number { // Dk2 sometimes uses fixed precision floats, this will parse them :)
	constructor(buffer,offset = 4) {
		super(buffer.readUintLE(offset,4)/4096)
	}
}

DK2Float.size = 4

class KWDGenericHeader extends Object {
	constructor(buffer) {
		super()
		this.ID = buffer.readUintLE(0,4)
		this.Size = buffer.readUintLE(4,4)
		// Quite embarrassed to say, I don't know if there's supposed to be something here between size and checkOne :(
		this.CheckOne = buffer.readUintLE(12,4)
		this.HeaderEndOffset = buffer.readUintLE(16,4)
		this.ItemCount = buffer.readUintLE(20,4)
		this.Unknown = buffer.readUintLE(24,4)
		this.DateCreated = new DK2TimeStamp(buffer.slice(28,38))
		this.DateModified = new DK2TimeStamp(buffer.slice(38,48))
	}
}
KWDGenericHeader.size = 48
ArtResourceType = {
	None: 0,
	Sprite: 1,
	Alpha: 2,
	AdditiveAlpha: 3,
	TerrainMesh: 4,
	Mesh: 5,
	AnimatingMesh: 6,
	ProceduralMesh: 7,
	MeshCollection: 8,
}

ArtResourceFlag = {
	Unknown: 1,
	PlayerColoured: 4, // Cannot take chances.
	PlayerColored: 4,
	HasStartAnimation: 8,
	HasEndAnimation: 16,
	RandomStartFrame: 32,
	OriginAtBottom: 64,
	Flat: 128,
	DoesntUseProgressiveMesh: 256,
	Unknown1: 512,
	Unknown2: 1024,
	UseAnimatingTextureForSelection: 2048,
	Preload: 4096,
	Blood: 8192
}

class DK2ArtResource extends Object {
	constructor(buffer_1) {
		super()
		this.Name = new DK2String(buffer_1,64)
		const buffer = buffer_1.slice(64)
		this.KeyId = buffer.readUintLE(0,4)
		this.Type = buffer[16]
		const type = this.Type;
		// * Now, I'm gonna go out on a teensy tiny limb and say I don't quite know how C++ unions work, but this is gonna be my best guess of how to parse the art resources since OpenKeeper(who I have been stealing from for the most part) doesn't actually HAVE this done yet! 5:42pm 9/27/2022
		// ! Nevermind, they did have that part done, and I'm just an idiot, but it sure does look like I copied their homework  6:14AM 9/30/2022
		if(type & (ArtResourceType.Sprite | ArtResourceType.Alpha | ArtResourceType.AdditiveAlpha) || type == ArtResourceType.None) {
			this.Width = buffer.readUintLE(4,4)
			this.Height = buffer.readUintLE(8,4)
			this.KeyFrames = buffer.readIntLE(12,2)
		} else if(type & (ArtResourceType.Mesh)) {
			this.Scale = buffer.readIntLE(4,4)
			this.Frames = buffer.readUintLE(8,4)
		} else if(type & ArtResourceType.AnimatingMesh) {
			this.Frames = buffer.readUintLE(4,4)
			this.Fps = buffer.ReadUintLE(8,4)
			this.StartDistance = buffer.ReadUintLE(12,2)
			this.EndDistance = buffer.ReadUintLE(14,2)
			this.KeyStartAf = buffer[17]
			this.KeyEndAf = buffer[18]
		} else if(type & ArtResourceType.ProceduralMesh) {
			this.id = buffer.ReadUintLE(4,4)
		} else if(type & ArtResourceType.TerrainMesh) {
			this.Unknown1 = buffer.ReadUintLE(4,4)
			this.Unknown2 = buffer.ReadUintLE(8,4)
			this.Frames = buffer[9]
		}
		this.SometimesOne = buffer[19]
	}
}

class DK2Animation extends DK2ArtResource {
	constructor(buffer) {
		super(buffer)
	}
}

DK2Animation.GenerateArray = function(buffer,offset,length) {
	array = []
	for(let i = 0; i < length; i++) {
		array.push(new DK2Animation(buffer.slice(offset,offset+=84)))
	}
	return array
}

class DK2Light extends Object {
	constructor(buffer) {
		super()
		this.MatrixPos = [new DK2Float(buffer),new DK2Float(buffer,4),new DK2Float(buffer,8)]
		this.Radius = new DK2Float(buffer,12)
		this.Flags = buffer.readUIntLE(16,4)
		this.Color = [buffer[21],buffer[22],buffer[23],buffer[24]]
	}
}

DK2Light.size = 25

class DK2TimeStamp extends Date {
	constructor(buffer) {
		const inputType = typeof(buffer)
		if(inputType != typeof(Buffer.allocUnsafe(0)) && inputType != typeof(undefined)) {
			throw("DK2 Timestamps need to be made with a Buffer, thanks.", typeof(buffer))
		} else {
			super()
			if(inputType === typeof(undefined)) {
				return
			} else {
			this.setFullYear(buffer.readUintLE(0,2))
			this.setDate(buffer[2])
			this.setMonth(buffer[3])
			this.setHours(buffer[6])
			this.setMinutes(buffer[7])
			this.setSeconds(buffer[8])
			this.setMilliseconds(0)
			}
		}
	}
	toBuffer() {
		const buffer = Buffer.allocUnsafe(10)
		buffer.fill(0)
		buffer.writeUint16LE(this.getFullYear(),0)
		buffer[2] = this.getDate()
		buffer[3] = this.getMonth()
		buffer[6] = this.getHours()
		buffer[7] = this.getMinutes()
		buffer[8] = this.getSeconds()
		return buffer
	}
}

module.exports = {KWDGenericHeader, DK2TimeStamp, DK2ArtResource, DK2String, DK2Float, DK2Animation, DK2Light}