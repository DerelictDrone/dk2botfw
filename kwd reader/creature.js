const KWDHeaders = require('./header')

class DK2Creature extends Object{
	constructor(buffer) {
		super()
		this.Name = new KWDHeaders.DK2String(buffer)
		this.UnknArtResource = new KWDHeaders.DK2ArtResource(buffer.slice(32,116))
		// Anim section time!
		this.Animations = KWDHeaders.DK2Animation.GenerateArray(buffer,116,36) // 35 consecutive animation parses, 116+(84*36) = 3140
		this.GuiIcon = new KWDHeaders.DK2ArtResource(buffer.slice(3140,3224))
		this.EditorIcon = new KWDHeaders.DK2ArtResource(buffer.slice(3224,3308))
		this.Unknown1 = buffer.readUintLE(3308,2)
		this.Unknown2 = buffer.readUintLE(3310,4)
		this.Unknown3 = buffer.readUintLE(3314,4)
		this.EditorOrder = buffer[3318]
		this.AngerStringIdGeneral = buffer.readUintLE(3319,2)
		this.ShotDelay = new KWDHeaders.DK2Float(buffer,3321)
		this.OlhiEffectId = buffer.readUintLE(3325,2) 
		// ^ Only used by King Reginald in vanilla dk2, most likely doesn't actually do ANYTHING since he also has own land health increase per second(230) set up.
		this.IntroductionStringId = buffer.readUintLE(3327,2)
		this.SightRange = new KWDHeaders.DK2Float(buffer,3329)
		this.AngerStringIdLair = buffer.readUintLE(3333,2)
		this.AngerStringIdFood = buffer.readUintLE(3335,2)
		this.AngerStringIdPay = buffer.readUintLE(3337,2)
		this.AngerStringIdSlap = buffer.readUintLE(3339,2)
		this.AngerStringIdHeld = buffer.readUintLE(3341,2)
		this.AngerStringIdLonely = buffer.readUintLE(3343,2) // Most likely unused, but best to read it anyways
		this.AngerStringIdHatred = buffer.readUintLE(3345,2)
		this.AngerStringIdTorture = buffer.readUintLE(3347,2)
		this.TranslationSoundCategory = new KWDHeaders.DK2String(buffer,32,3349)
		this.ShuffleSpeed = new KWDHeaders.DK2Float(buffer,3383) // Used for when a creature is on 2 petals of health
		// 3 or so bytes missing here, or there's some bad offsets, who knows
		this.CloneCreatureId = buffer[3387]
		this.FirstPersonGammaEfect = buffer[3388]
		this.FirstPersonWalkCycleScale = buffer[3389]
		this.IntroCameraPathIndex = buffer[3390]
		this.Unknown4 = buffer[3391]
		this.Portrait = new KWDHeaders.DK2ArtResource(buffer.slice(3392,3476))
		this.Light = new KWDHeaders.DK2Light(buffer.slice(3476,3501))
		this.Attractions = [new DK2CreatureAttraction(buffer.slice(3502,3510)),new DK2CreatureAttraction(buffer.slice(3510,3518))]
		this.FirstPersonWaddleScale = new KWDHeaders.DK2Float(buffer,3519)
		this.FirstPersonOscillateScale = new KWDHeaders.DK2Float(buffer,3523)
		this.Spells = [new DK2CreatureSpellShort(buffer.slice(3527,3553)),new DK2CreatureSpellShort(buffer.slice(3553,3579)),new DK2CreatureSpellShort(buffer.slice(3579,3605))]
		this.Resistances = [new DK2CreatureResistance(buffer.slice(3605,3607)),new DK2CreatureResistance(buffer.slice(3607,3609)),new DK2CreatureResistance(buffer.slice(3609,3611)),new DK2CreatureResistance(buffer.slice(3611,3613))]
		this.HappyJobs = [new DK2CreatureJobPreference(buffer.slice(3611,3624)),new DK2CreatureJobPreference(buffer.slice(3624,3637)),new DK2CreatureJobPreference(buffer.slice(3637,3650))]
		this.UnhappyJobs = [new DK2CreatureJobPreference(buffer.slice(3650,3663)),new DK2CreatureJobPreference(buffer.slice(3663,3676))]
		this.AngryJobs = [new DK2CreatureJobPreference(buffer.slice(3676,3689)),new DK2CreatureJobPreference(buffer.slice(3689,3702)),new DK2CreatureJobPreference(buffer.slice(3702,3715))]
		this.HatedJobs = [new DK2CreatureJobPreference(buffer.slice(3715,3728)),new DK2CreatureJobPreference(buffer.slice(3728,3741))]
		this.JobAlternatives = [new DK2CreatureJobPreference(buffer.slice(3741,3754)),new DK2CreatureJobPreference(buffer.slice(3754,3767)),new DK2CreatureJobPreference(buffer.slice(3767,3780))]
		this.AnimationOffsets = {PortalEntrance: [new KWDHeaders.DK2Float(buffer,3781),new KWDHeaders.DK2Float(buffer,3785),new KWDHeaders.DK2Float(buffer,3789)]}
		this.Unknown6 = buffer.readIntLE(3789,4)
		this.Height = new KWDHeaders.DK2Float(buffer,3789)
	}
}
DK2Creature.AnimOffsetTypes = {
	PortalEntrance: 1,
	Praying: 2,
	FallBackGetUp: 3,
	Corpse: 4,
	Offset5: 5,
	Offset6: 6,
	Offset7: 7,
	Offset8: 8
}

class DK2CreatureAttraction extends Object{
	constructor(buffer) {
		super()
		this.Present = buffer.readUintLE(0,4)
		this.RoomId = buffer.readUintLE(4,2)
		this.RoomSize = buffer.readUintLE(6,2)
	}
}
DK2CreatureAttraction.size = 8

// To differentiate between creaturespells from the creaturespells file and the creaturespells format for here.
class DK2CreatureSpellShort extends Object{
	constructor(buffer) {
		super()
		this.ShotOffset = [new KWDHeaders.DK2Float(buffer), new KWDHeaders.DK2Float(buffer,4), new KWDHeaders.DK2Float(buffer,8), new KWDHeaders.DK2Float(buffer,12)]
		this.Unknown1 = buffer[17]
		this.PlayAnimation = buffer[18] === 1 ? true : buffer[18]
		this.Unknown2 = buffer[19] // Supposedly this value can randomly change when saving maps, regardless of if you did anything or not.
		this.Unknown3 = buffer[20]
		this.ShotDelay = new KWDHeaders.DK2Float(buffer,21)
		this.Unknown4 = buffer[22]
		this.Unknown5 = buffer[23]
		this.CreatureSpellId = buffer[24]
		this.LevelAvailable = buffer[25]
	}
}
DK2CreatureSpellShort.size = 26

class DK2CreatureResistance extends Object{
	constructor(buffer) {
		super()
		this.AttackType = buffer[0]
		this.Value = buffer[1]
	}
}

DK2CreatureResistance.size = 2

class DK2CreatureJobPreference extends Object {
	constructor(buffer) {
		super()
		this.JobType = buffer.readUintLE(0,4)
		this.MoodChange = buffer.readUintLE(4,2)
		this.ManaChange = buffer.readUintLE(6,2)
		this.Chance = buffer[9]
		this.Unknown1 = buffer[10]
		this.Unknown2 = buffer[11]
		this.Unknown3 = buffer[12]
	}
}
DK2CreatureJobPreference.size = 13

module.exports = {DK2Creature}