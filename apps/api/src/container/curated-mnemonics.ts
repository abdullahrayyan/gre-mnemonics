/**
 * Hand-vetted mnemonics that OVERRIDE the AI-generated corpus.
 *
 * The generator is inconsistent on some words — it falls back to circular or
 * gibberish hooks ("Curmudge + On", "Cunning Run", "Count + Tenance"). Entries
 * here are curated by hand and always win, so quality never regresses when the
 * corpus is regenerated. Keyed by lowercase word.
 *
 * Each entry is ONE hook + sentence (the format from the reference table), so a
 * curated word shows a single "Mnemonic" instead of the English/Hinglish pair.
 */
export interface CuratedEntry {
  meaning?: string;
  hindiMeaning?: string;
  /** The hook + the sentence that ties it to the meaning. */
  mnemonic: string;
}

export const CURATED_MNEMONICS: Record<string, CuratedEntry> = {
  countenance: {
    meaning: "A person's face or facial expression; support.",
    hindiMeaning: 'Chehra / Samarthan',
    mnemonic: `"Count the Nuance": Looking closely at someone's face to count the subtle expressions (nuances) on their countenance.`,
  },
  covert: {
    meaning: 'Not openly acknowledged or displayed; secret.',
    hindiMeaning: 'Gupt / Chhupa hua',
    mnemonic: `"Covered": It sounds exactly like covered — a covert operation is completely covered up.`,
  },
  counterfeit: {
    meaning: 'A fraudulent imitation of something else; fake.',
    hindiMeaning: 'Nakli / Jhootha',
    mnemonic: `"Counter + Fit": Giving fake notes at the counter that don't fit the legal standards.`,
  },
  covet: {
    meaning: 'Yearn to possess or have something belonging to someone else.',
    hindiMeaning: 'Laalach karna / Chaahna',
    mnemonic: `"Covertly want it": You look at your friend's new car and covetously wish you could take it for yourself.`,
  },
  coy: {
    meaning: 'Making a pretense of shyness or modesty that is intended to be alluring.',
    hindiMeaning: 'Sharmila / Nakhreli',
    mnemonic: `"Toying": Acting shy and playing with a toy or your hair to look innocent.`,
  },
  crafty: {
    meaning: "Clever at achieving one's aims by deceitful or evasive methods.",
    hindiMeaning: 'Chalaak / Shaatir',
    mnemonic: `"Craft": Someone who uses their craft (skills) not for art, but to trick people.`,
  },
  craven: {
    meaning: 'Contemptibly lacking in courage; cowardly.',
    hindiMeaning: 'Darpok / Kayar',
    mnemonic: `"Cave in": A soldier who caves in instantly out of fear because he is craven.`,
  },
  crescendo: {
    meaning: 'A gradual increase in loudness or intensity.',
    hindiMeaning: 'Awaaz ya tivrata ka badhna',
    mnemonic: `"Increase-endo": Think of a musical beat that starts low and rises to a massive peak.`,
  },
  credible: {
    meaning: 'Able to be believed; convincing.',
    hindiMeaning: 'Vishwasniya',
    mnemonic: `"Credit card": The bank only gives a credit card to someone who is credible (trustworthy).`,
  },
  crestfallen: {
    meaning: 'Sad and disappointed.',
    hindiMeaning: 'Nirash / Udaas',
    mnemonic: `"Crest (Top) + Fallen": You were riding high at the crest of the wave, but then you fell down — totally disappointed.`,
  },
  croon: {
    meaning: 'Hum or sing in a soft, low voice, especially in a sentimental manner.',
    hindiMeaning: 'Gungunana',
    mnemonic: `"Crow turning into a Peacock": Imagine a bird trying to sing a smooth, romantic melody softly.`,
  },
  cumbersome: {
    meaning: 'Large or heavy and therefore difficult to carry or use; unwieldy.',
    hindiMeaning: 'Bhari / Bojhil',
    mnemonic: `"Kamra-some": A piece of furniture so big it takes up the whole kamra (room) and is tough to move.`,
  },
  cunning: {
    meaning: "Having or showing skill in achieving one's ends by deceit.",
    hindiMeaning: 'Chalaak',
    mnemonic: `"Kan-kaatna": Someone so sharp they can kaat your kaan without you noticing.`,
  },
  curb: {
    meaning: 'Restrain or keep in check.',
    hindiMeaning: 'Rokna / Lagaam lagana',
    mnemonic: `"Curb on the road": The concrete curb keeps the cars from driving off the road — it curbs them.`,
  },
  curmudgeon: {
    meaning: 'A bad-tempered or surly person.',
    hindiMeaning: 'Chidchida insaan',
    mnemonic: `"Car + Mud": An old, angry man whose car got stuck in the mud, making him highly irritated.`,
  },
  cursory: {
    meaning: 'Hasty and therefore not thorough or detailed.',
    hindiMeaning: 'Sarsari / Jaldbazi ka',
    mnemonic: `"Cursor": Moving your computer cursor lightning-fast across the screen just to skim a page.`,
  },
  curtail: {
    meaning: 'Reduce in extent or quantity.',
    hindiMeaning: 'Kam karna',
    mnemonic: `"Cut the tail": Stripping down resources or time to shorten it.`,
  },
  daunting: {
    meaning: 'Seeming difficult to deal with in anticipation; intimidating.',
    hindiMeaning: 'Daraona / Kathin',
    mnemonic: `"Daantna": A task so massive it feels like a strict teacher daant-ing (scolding) you just by looking at it.`,
  },
};
