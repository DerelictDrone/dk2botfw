const KWDHeaders = require('./header')

class DK2Door extends Object {
	constructor(buffer) {
		super()
		this.Name = new KWDHeaders.DK2String(buffer) // this class automatically slices buffer from 0 to 32
		this.Mesh = new KWDHeaders.DK2ArtResource(buffer.slice(116,200))
		this.EditorIcon = new KWDHeaders.DK2ArtResource(buffer.slice(200,284))
		this.GuiIcon = new KWDHeaders.DK2ArtResource(buffer.slice(284,368))
		this.OpenResource = new KWDHeaders.DK2ArtResource(buffer.slice(368,452))
		this.CloseResource = new KWDHeaders.DK2ArtResource(buffer.slice(452,536))
		this.Height = KWDHeaders.DK2Float(buffer,536)
		this.HealthGain = buffer.readUintLE(540,2)
		this.Unknown1 = buffer.readUintLE(542,2)
		this.Unknown2 = buffer.readUintLE(546,4)
		this.ResearchTime = buffer.readUintLE(548,2)
		this.Material = buffer[549]
		this.TrapTypeId = buffer[548]
		this.Flags = buffer.readUintLE(549,4)
		this.Health = buffer.readUintLE(556,2)
		this.GoldCost = buffer.readUintLE(558,2)
		this.Unknown3 = [buffer.readUintLE(560,2),buffer.readUintLE(562,2)] // I dunno WHY exactly they handle it like this, but I'm sure one day we'll discover this thing's purpose
		this.DeathEffectID = buffer.readUintLE(564,2)
		this.ManufToBuild = buffer.readUintLE(566,4)
		this.ManaCost = buffer.readUintLE(570,2)
		this.TooltipStringId = buffer.readUintLE(572,2)
		this.NameStringId = buffer.readUintLE(574,2)
		this.GeneralDescriptionStringId = buffer.readUintLE(576,2)
		this.StrengthStringId = buffer.readUintLE(578,2)
		this.WeaknessStringId = buffer.readUintLE(580,2)
		this.DoorId = buffer[581]
		this.EditorOrder = buffer[582]
		this.setManufCrateObjectId = buffer[583]
		this.KeyObjectId = buffer[584]
		this.SoundCategory = new KWDHeaders.DK2String(buffer,32,584) //Useless right now as I don't know the offset for this.
	}
}

module.exports = { DK2Door }