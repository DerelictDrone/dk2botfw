const KWDHeaders = require('./header')

class DK2KeeperSpell extends Object {
	constructor(buffer) {
		super()
		this.Name = new KWDHeaders.DK2String(buffer,32)
		this.GuiIcon = new KWDHeaders.DK2ArtResource(buffer.slice(32,116))
		this.EditorIcon = new KWDHeaders.DK2ArtResource(buffer.slice(116,200))
		this.xc8 = buffer.readUintLE(200,4)
		this.RechargeTime = new KWDHeaders.DK2Float(buffer,204) // Potentially stored as turns, according to OpenKeeper
		this.ShotData1 = buffer.readUintLE(208,4)
		this.ShotData2 = buffer.readUintLE(212,4)
		this.ResearchTime = buffer.readUintLE(216,2)
		this.TargetRule = buffer[218]
		this.EditorOrder = buffer[219]
		this.KeeperSpellFlags = buffer.readUintLE(220,4)
		this.x00Unreferenced = buffer.readUintLE(224,2)
		this.ManaDrain = buffer.readUintLE(226,2) // Drain over time, like when you have an active imp or horny is summoned
		this.ToolTipStringId = buffer.readUintLE(228,2)
		this.NameStringId = buffer.readUintLE(230,2)
		this.GeneralDescriptioNid = buffer.readUintLE(232,2)
		this.StrengthStringId = buffer.readUintLE(234,2)
		this.WeaknessStringId = buffer.readUintLE(236,2)
		this.KeeperSpellId = buffer.readUintLE(238,2); this.ID = this.KeeperSpellId // Backup var name for easier use
		this.CastRule = buffer[240]
		this.ShotTypeID = buffer[241]
		this.SoundCategory = new KWDHeaders.DK2String(buffer,32,241)
		this.Upgraded = {
			ResearchTime: buffer.readUintLE(273,2),
			ShotTypeId: buffer[275],
			ShotData1: buffer.readUintLE(276,4),
			ShotData2: buffer.readUintLE(280,4),
			// ManaCost goes here technically speaking
			GuiIcon: new KWDHeaders.DK2ArtResource(buffer.slice(288,372)) 
		}
		this.ManaCost = buffer.readUintLE(284,2)
		// ? 3 missing bytes around here somewhere, who KNOWS what they do?
		this.Unknown1 = buffer[285]
		this.Unknown2 = buffer[286]
		this.Unknown3 = buffer[287]
		// Upgraded.GuiIcon goes here, technically speaking but I've stowed them in an object for convenience
		this.SoundCategoryGui = new KWDHeaders.DK2String(buffer,32,372),
		this.HandAnimID = buffer[404]
		this.NoGoHandAnimID = buffer[405]
	}
}

DK2KeeperSpell.size = 406

module.exports = { DK2KeeperSpell }