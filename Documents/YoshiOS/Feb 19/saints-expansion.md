# Saints & Salvation — Database Expansion

## Slot Rotation System

The landscape has 20 fixed positions. Each position has a **slot type** that defines what kind of saint can fill it. Each slot type has 2 saints assigned to it — one from the original 20, one from the expansion — so each playthrough draws one saint per slot at random.

Some slots are defined by **visual feature** (the pillar, the boat, the gridiron) because the SVG composition is baked into the landscape. Others are defined by **zone context** (forest figure, monastery figure) where the saint just needs to be a robed figure that fits the environment.

### Slot Definitions

| # | Slot ID | x pos | Visual requirement | Zone | Pool (original → expansion) |
|---|---------|-------|-------------------|------|----------------------------|
| 1 | `garden` | 430 | Figure with staff near garden rows | Forest edge | Fiacre → Kevin |
| 2 | `animal` | 560 | Animal silhouette (not human) | Forest edge | Guinefort → Roch |
| 3 | `tree` | 720 | Figure in/above tree canopy | Forest | Christina → Margaret |
| 4 | `column` | 1130 | Column with environmental detail | Village | Bibiana → Apollonia |
| 5 | `road` | 1350 | Walking figure on the path | Village | Denis → Christopher |
| 6 | `dish` | 1520 | Figure holding plate/dish | Village | Lucy → Agatha* |
| 7 | `cathedral-ext` | 2060 | Figure near cathedral entrance | Cathedral | Agatha* → Cecilia |
| 8 | `cell` | 2148 | Tiny figure in cell doorway | Cathedral | Drogo → Januarius |
| 9 | `hive` | 2620 | Beehive/nature composition | Monastery | Ambrose → Scholastica |
| 10 | `levitate` | 2720 | Floating figure above building | Monastery | Joseph → Francis |
| 11 | `scribe` | 2780 | Seated figure with book | Monastery | Isidore → Bede |
| 12 | `ink` | 2860 | Monk with book + detail | Monastery | Columba → Hildegard |
| 13 | `beds` | 3150 | Figure standing over beds/furniture | Town | Julian → Nicholas |
| 14 | `cross` | 3350 | Figure on a cross | Town edge | Wilgefortis → Expeditus |
| 15 | `pillar` | 3700 | Figure atop tall pillar | Desert | Simeon → Polycarp |
| 16 | `demons` | 3950 | Figure surrounded by dark shapes | Desert | Anthony → Ignatius |
| 17 | `grill` | 4580 | Figure on gridiron / fire feature | Battlefield | Lawrence → Erasmus |
| 18 | `skin` | 4750 | Figure with trailing/hanging detail | Battlefield | Bartholomew → Catherine |
| 19 | `arrows` | 4900 | Figure pierced by projectiles | Battlefield | Sebastian → Giles |
| 20 | `boat` | 7100 | Figure in boat on water | Sea | Brendan → Ursula |

*Agatha appears in both slot 6 and 7 pools because her visual (plate) works in either context. In practice she'll only appear in one slot per session. If Agatha is drawn for slot 6, slot 7 draws from its expansion saint (Cecilia) guaranteed, and vice versa.

### Rotation Logic

```
for each slot:
  pool = [original_saint, expansion_saint]
  selected = pool[random(0,1)]
  place(selected, slot.x, slot.y)
```

If a saint appears in multiple slot pools (like Agatha), the system draws her slot first and locks her out of other pools for that session.

---

## Expansion Saints (21–40)

### 21. St. Kevin of Glendalough
**Patron of:** blackbirds

A 6th-century Irish hermit who retreated to a cave at Glendalough to pray in solitude. During Lent, he knelt with his arms extended in prayer and a blackbird landed on his open palm and laid eggs in it. Kevin held his hand perfectly still until the eggs hatched and the chicks fledged. The story does not specify how long this took, but blackbird incubation is approximately two weeks. He is depicted with arms outstretched and birds nesting in his hands, looking serene about the whole situation.

```
base: 5  mart: 0  absurd: 5  devot: 5
Tags: hermit, endurance, animal, nature
Slot: garden (430) — figure with arms extended, birds on hand. Staff replaced by outstretched-arm silhouette with small oval shapes (eggs/birds) on palm.
```

---

### 22. St. Roch (Rocco)
**Patron of:** dogs, plague victims, falsely accused people

A 14th-century French nobleman who gave away his fortune and set off on pilgrimage. He contracted plague while tending the sick in Italy and crawled into a forest to die alone. A dog belonging to a local nobleman found him and brought him bread every day until he recovered. He was later arrested as a spy in his own hometown, unrecognized, and died in prison. The dog is always depicted beside him, bread in mouth, which is more loyalty than most of the humans in the story demonstrated.

```
base: 6  mart: 1  absurd: 3  devot: 4
Tags: animal, plague, pilgrimage, suffering
Slot: animal (560) — dog silhouette carrying a small rect (bread) in its mouth, with a faint robed figure behind/beside it. The dog is the primary visual, echoing Guinefort.
```

---

### 23. St. Margaret of Antioch
**Patron of:** pregnant women, escape from danger

A young Christian woman swallowed whole by Satan in the form of a dragon while in prison around 304 AD. Inside the dragon's stomach, she made the sign of the cross, which caused the creature to explode. She climbed out unharmed. She was then beheaded, because the Romans were not going to let a technicality stop them. She is one of the most frequently depicted saints in medieval art, usually shown stepping calmly out of a dragon as if exiting a taxi.

```
base: 8  mart: 5  absurd: 5  devot: 3
Tags: martyrdom, miracle, dragon, defiance
Slot: tree (720) — figure emerging from a large, dark organic shape (the dragon/beast) among the tree canopy. The dragon-shape doubles as foliage at a glance, making it a genuine discovery when you realize what you're looking at.
```

---

### 24. St. Apollonia
**Patron of:** dentists, toothache sufferers

An elderly deaconess in Alexandria martyred during anti-Christian riots in 249 AD. The mob seized her and smashed out all of her teeth with pincers, then built a pyre and threatened to burn her alive unless she renounced her faith. She asked for a moment to think, then voluntarily jumped into the fire. She is depicted holding pincers with a tooth in them, smiling. Medieval prayer cards to St. Apollonia were so widely distributed that they may constitute the earliest form of dental advertising.

```
base: 7  mart: 5  absurd: 3  devot: 4
Tags: martyrdom, defiance, teeth, courage
Slot: column (1130) — a column (replacing Bibiana's) with a small figure beside it holding an implement (pincers). Teeth-like small white shapes scattered at the column's base.
```

---

### 25. St. Christopher
**Patron of:** travelers, surfers, automobile drivers

A giant — some traditions say 7.5 feet tall — who sought to serve the most powerful king in the world. He served a human king, then the Devil, then decided to serve Christ by carrying travelers across a dangerous river. One night a child asked to be carried. Midstream, the child became impossibly heavy — Christopher was carrying the weight of the entire world. The child revealed himself as Christ. In the Eastern Orthodox tradition, Christopher is sometimes depicted with the head of a dog, for reasons that have generated centuries of uncomfortable scholarly debate.

```
base: 7  mart: 3  absurd: 4  devot: 3
Tags: giant, miracle, pilgrimage, service
Slot: road (1350) — a tall figure (notably larger than other saints, ~50px) walking on the path, carrying a small figure on his shoulders. The size difference makes him visible but not immediately identifiable as a saint rather than a landscape feature.
```

---

### 26. St. Cecilia
**Patron of:** musicians, poets, organ builders

A Roman noblewoman martyred around 230 AD. According to her legend, she heard heavenly music in her heart during her forced wedding to the pagan Valerian, which is why she became patron of music. Her execution was botched three times: the executioner struck her neck with a sword three times (the legal maximum) and failed to sever her head. She lay bleeding on the floor for three days, during which she continued to preach, before finally dying. She is typically depicted with a small organ or lute, looking serene about the neck wounds.

```
base: 8  mart: 4  absurd: 3  devot: 4
Tags: martyrdom, music, preaching, endurance
Slot: cathedral-ext (2060) — robed figure near the cathedral entrance, with a small rectangular shape suggesting a portable organ or musical instrument. Thin parallel lines near her (sound/music suggestion).
```

---

### 27. St. Januarius (San Gennaro)
**Patron of:** blood banks, Naples

The Bishop of Benevento, martyred around 305 AD. His primary claim to ongoing fame is that a vial of his dried blood, preserved in the Cathedral of Naples, periodically liquefies. This has happened approximately three times a year since 1389. When the blood fails to liquefy, it is considered an omen of disaster — and historically, years when the blood stayed solid have correlated with earthquakes, epidemics, and Napoli losing in Serie A. The Vatican has never officially endorsed the miracle but has also never investigated it, which is its own kind of statement.

```
base: 6  mart: 4  absurd: 4  devot: 3
Tags: martyrdom, blood, miracle, ongoing
Slot: cell (2148) — small figure in the cell/alcove doorway, holding a vial (small elongated oval with dark red fill). The vial is the identifying detail. Very small, hard to spot — rewards close looking.
```

---

### 28. St. Scholastica
**Patron of:** nuns, convulsive children, storms

The twin sister of St. Benedict, founder of Western monasticism. During their last meeting in 543 AD, she wanted to continue their theological discussion past nightfall, but Benedict insisted on returning to his monastery. Scholastica prayed, and an immediate, violent thunderstorm erupted — so severe that Benedict could not leave. She got three more hours of conversation. She died three days later. Benedict reportedly saw her soul ascending to heaven in the form of a dove, which is either a beautiful metaphor or an unusual ornithological event.

```
base: 5  mart: 0  absurd: 4  devot: 5
Tags: miracle, learning, determination, family
Slot: hive (2620) — instead of a beehive, a composition of a small figure beside a cloud shape with thin lightning-bolt lines. Rain-line strokes falling. The "nature composition" approach of the hive slot works for a storm scene.
```

---

### 29. St. Francis of Assisi
**Patron of:** animals, ecology, Italy, merchants

Renounced his wealthy family by stripping naked in the town square and handing his father his clothes back. Preached a sermon to a flock of birds, who reportedly listened attentively, which is more than most human congregations manage. Received the stigmata — the wounds of Christ appearing spontaneously on his hands, feet, and side — making him the first person in recorded history to experience the phenomenon. He composed the first great poem in the Italian vernacular while going blind. He asked to be laid naked on the bare earth to die, to own nothing at the end.

```
base: 9  mart: 2  absurd: 3  devot: 5
Tags: stigmata, animal, poverty, mystic
Slot: levitate (2720) — figure with arms raised (echoing the stigmata pose), surrounded by tiny bird shapes (small V-marks). Not literally levitating like Joseph of Cupertino, but elevated on a small mound/rock, arms wide, birds circling — reads as "floating" at thumbnail scale.
```

---

### 30. St. Bede the Venerable
**Patron of:** historians, scholars, English writers

A 7th-century Northumbrian monk who spent his entire life — from age seven to his death at sixty-two — in the same monastery at Jarrow. He never traveled more than seventy-five miles from where he was born. In that time, he wrote the Ecclesiastical History of the English People, which remains the single most important source for early English history. He also calculated the date of Easter, standardized the AD dating system now used worldwide, and was the first person to use the phrase "Anno Domini." He is the only Englishman Dante placed in Paradise.

```
base: 6  mart: 0  absurd: 2  devot: 5
Tags: scholar, learning, history, humility
Slot: scribe (2780) — seated figure hunched over a large book (rect), with a thin diagonal line (quill) extending from the hand. Nearly identical in silhouette to Isidore, distinguished by slightly smaller book and hunched posture. A "boring" saint mechanically — low absurdity — but high devotion. Useful for devotion-stacking strategies.
```

---

### 31. St. Hildegard of Bingen
**Patron of:** natural history, musicians, writers, linguists

A 12th-century Benedictine abbess who experienced visions from age three, composed 77 liturgical songs (the largest surviving repertoire of any medieval composer), invented a constructed language (Lingua Ignota), wrote two encyclopedias of natural science, practiced medicine, corresponded with popes and emperors as an equal, and was formally investigated for heresy exactly once, at which point the papal commission reviewed her writings and concluded she was genuinely channeling divine revelation. She was not formally canonized until 2012 — an 830-year backlog.

```
base: 7  mart: 0  absurd: 3  devot: 5
Tags: mystic, music, learning, authority
Slot: ink (2860) — figure with a book, but distinguished from Columba/Bede by radiating lines emanating from the head (vision/light motif). The lines are thin, gold, low opacity — suggesting illumination. A subtle visual that rewards close inspection.
```

---

### 32. St. Nicholas of Myra
**Patron of:** children, sailors, pawnbrokers, unmarried women, all of Russia

A 4th-century bishop. At the Council of Nicaea in 325 AD — the most important theological gathering in Christian history, convened to settle the nature of Christ — Nicholas became so enraged at the heretic Arius that he walked across the room and punched him in the face. He was immediately stripped of his bishopric and imprisoned. According to tradition, Christ and the Virgin Mary appeared to him in his cell and restored his vestments. He is also the historical basis for Santa Claus, a fact that says something complicated about cultural memory.

```
base: 8  mart: 0  absurd: 4  devot: 4
Tags: authority, violence, generosity, children
Slot: beds (3150) — instead of Julian's beds, the composition shows a figure with arm extended (the punch). A second, smaller figure on the ground (Arius). The "beds" slot becomes generic "figure + secondary element" — works for both Julian's beds and Nicholas's fallen heretic.
```

---

### 33. St. Expeditus
**Patron of:** urgent causes, emergencies, procrastinators

Possibly a Roman centurion martyred around 303 AD. Possibly entirely fictional — a clerical error. The leading theory is that a shipment of relics arrived at a French convent with the label "EXPEDITE" (meaning "urgent / deliver quickly"), and the nuns assumed this was the name of the saint inside. He was nevertheless widely venerated, particularly in Latin America, where he is invoked for last-minute interventions, overdue bills, and legal deadlines. He is depicted holding a cross marked "HODIE" (today) while stomping on a crow that screams "CRAS" (tomorrow). The iconography is surprisingly clear for someone who may be a shipping label.

```
base: 3  mart: 2  absurd: 5  devot: 1
Tags: fictional, urgency, folk, military
Slot: cross (3350) — figure holding a cross (like Wilgefortis but standing, not crucified), foot on a bird shape (the crow). Distinguished from Wilgefortis by vertical posture.

Synergy: Collecting both Expeditus and Wilgefortis → "Apocryphal Credulity" bonus/penalty (they're both probably fake). Stacks with the existing Wilgefortis −2 deduction.
```

---

### 34. St. Polycarp of Smyrna
**Patron of:** earache sufferers (for unclear reasons)

The Bishop of Smyrna, martyred around 155 AD — one of the earliest recorded Christian martyrdoms. When the Romans attempted to burn him at the stake, the flames reportedly arched around his body like a sail filled with wind, refusing to touch him. He smelled of baking bread and incense rather than burning flesh. The executioner was ordered to stab him instead, and when the blade entered his side, so much blood poured out that it extinguished the fire. He is one of the Apostolic Fathers — a direct student of the Apostle John — making him the closest link in the database to the original source material.

```
base: 9  mart: 5  absurd: 4  devot: 5
Tags: martyrdom, fire, miracle, apostolic
Slot: pillar (3700) — figure atop a pillar of flame shapes (arched curves) rather than Simeon's stone pillar. The flames curve around the figure without touching it. Same tall vertical composition, different texture. One of the highest-scoring saints in the database.
```

---

### 35. St. Ignatius of Antioch
**Patron of:** church in Eastern Mediterranean, throat diseases

A 1st-century bishop who wrote a series of letters while being transported to Rome for execution around 108 AD. His execution was being fed to lions in the Colosseum. Rather than express fear, his letters express impatience. He wrote: "I am God's wheat, and I am to be ground by the teeth of wild beasts, so that I may become the pure bread of Christ." He explicitly asked his followers not to intervene, because he wanted to be eaten. He is one of the earliest Christian theologians, and his letters remain foundational texts, which is remarkable given that their author was actively looking forward to being devoured.

```
base: 9  mart: 5  absurd: 4  devot: 5
Tags: martyrdom, letters, courage, apostolic
Slot: demons (3950) — figure surrounded by dark animal shapes (lions instead of Anthony's abstract demons). The shapes are lower to the ground, more bestial. Tiny eye-dots in gold rather than red.
```

---

### 36. St. Erasmus (St. Elmo)
**Patron of:** sailors, abdominal pain, ammunition

A bishop martyred around 303 AD by having his intestines wound around a windlass — a rotating wooden cylinder used to haul anchors. This is one of the most viscerally specific martyrdoms in the entire canon. Medieval sailors later associated the electrical weather phenomenon known as St. Elmo's fire with his intercession, because they needed someone to pray to during storms and his name was close enough. He is depicted with a windlass and a length of intestine, looking remarkably composed for someone undergoing disembowelment.

```
base: 8  mart: 5  absurd: 4  devot: 3
Tags: martyrdom, sailors, pain, confusion
Slot: grill (4580) — figure with a horizontal cylinder shape (the windlass) instead of Lawrence's gridiron. A trailing line (the intestine) winds around the cylinder. Same "figure + torture device" composition, different device.
```

---

### 37. St. Catherine of Alexandria
**Patron of:** philosophers, librarians, wheelwrights, unmarried women

A 4th-century scholar who debated fifty pagan philosophers sent by the emperor and converted all of them. Sentenced to be broken on a spiked wheel, but when she touched the wheel it shattered, killing several bystanders. She was then beheaded. The Catherine Wheel firework is named after the spiked wheel that failed to kill her. She may not have existed — her cult was so popular that the Vatican quietly removed her from the liturgical calendar in 1969, then restored her in 2002 after public outcry.

```
base: 8  mart: 5  absurd: 4  devot: 3
Tags: martyrdom, learning, defiance, fictional
Slot: skin (4750) — figure with a large circle (the broken wheel) beside/behind her, with radiating line fragments (the shattered spokes). Replaces Bartholomew's trailing-skin composition with a wheel-fragment composition. Same "figure + dramatic attribute" visual logic.

Synergy: Collecting Catherine + Isidore or Bede → "Scholars of the Faith" bonus (+3).
```

---

### 38. St. Giles
**Patron of:** the disabled, lepers, nursing mothers, blacksmiths

A 7th-century hermit living in a forest near Nîmes, France. A deer he had befriended would bring him milk. When the local king's hunters pursued the deer, it fled to Giles for protection. A hunter fired an arrow at the deer, hitting Giles in the hand instead. The king, discovering the hermit, was so moved that he built a monastery around him. Giles's entire sainthood originates from taking an arrow for a deer. He deliberately refused to heal the wound, keeping it as a reminder of the cost of compassion.

```
base: 5  mart: 1  absurd: 4  devot: 4
Tags: hermit, animal, wound, compassion
Slot: arrows (4900) — figure with one arrow in the hand (not multiple arrows like Sebastian). A deer silhouette beside the figure. The single-arrow composition is visually distinct from Sebastian's porcupine-like piercing.
```

---

### 39. St. Ursula
**Patron of:** students, archers, orphans, the British Virgin Islands

A possibly legendary British princess who set out on pilgrimage to Rome with 11,000 virgin companions. On their return through Cologne, they were massacred by the Huns, who offered to spare Ursula if she married their chief. She refused. All 11,000 were killed. The number may originate from a misreading of a Latin inscription: "XI M V" could mean "11 martyred virgins" rather than "11,000 virgins." If the smaller reading is correct, the entire cult represents the largest known rounding error in religious history.

```
base: 7  mart: 5  absurd: 5  devot: 3
Tags: martyrdom, pilgrimage, legendary, women
Slot: boat (7100) — figure in a boat (like Brendan), but the boat is larger, with small vertical lines along the sides suggesting many passengers (the 11,000). A distinct visual from Brendan's single-mast craft. The "full" boat vs. the "solo" boat.

Synergy: Collecting Ursula + Brendan (if both somehow available in a run — they can't be, since they share a slot) is impossible by design. This is a deliberate null-synergy: the game teases a "Navigation" bonus that can never be achieved.
```

---

### 40. St. Cuthbert of Lindisfarne
**Patron of:** northern England, otters

A 7th-century monk and bishop of Lindisfarne. He would wade into the North Sea at night up to his waist and pray until dawn. When he emerged, otters would come and dry his feet with their fur. His body was found incorrupt eleven years after burial, and it was transported across northern England for centuries by monks fleeing Viking raids — the longest posthumous journey of any English saint. Durham Cathedral was eventually built to house him. When his tomb was opened in 1827, his body was still intact. The otters are unverified.

```
base: 6  mart: 0  absurd: 4  devot: 5
Tags: hermit, animal, endurance, incorrupt
Slot: This saint has no slot in the current 20-slot system. He exists as a RESERVE — available if the database expands to 25 slots or if a coastal/water secondary slot is added.
```

---

## Updated Scoring Synergies

With 40 saints and a 7-slot reliquary, the synergy system needs more options to make curation feel strategic. Here's the expanded list:

### Positive Synergies

| Condition | Bonus | Name on judgment screen |
|-----------|-------|------------------------|
| 8+ unique tags collected | +10 | Theological Breadth |
| 5+ unique tags collected | +5 | Doctrinal Curiosity |
| Martyrdom total ≥ 15 | +30% of martyrdom | Blood Witness Multiplier |
| Absurdity total ≥ 20 | +25% of absurdity | Divine Comedy Modifier |
| Devotion total ≥ 18 | +20% of devotion | Sustained Piety |
| Collected Guinefort OR Roch (a dog saint) | +3 | Intercession of a Good Dog |
| Collected Guinefort AND Roch (both dogs) | +6 (replaces +3) | Intercession of Very Good Dogs |
| Lawrence + Bibiana | +4 | Humor & Regret |
| Catherine + any of: Isidore, Bede, Hildegard | +3 | Scholars of the Faith |
| Polycarp + Ignatius | +5 | Apostolic Witness (both knew apostles directly) |
| Francis + any animal-tagged saint | +3 | Peaceable Kingdom |
| Scholastica + Benedict (not in DB, but if added) | — | Reserved for future |
| Margaret + any dragon/beast-tagged | +2 | Harrowing of Beasts |
| 3+ saints with `endurance` tag | +4 | Perseverance of the Saints |
| 3+ saints with `learning` tag | +3 | Doctors of the Church |
| All 7 collected saints are martyrs (mart ≥ 3) | +8 | Full Martyrology |
| All 7 collected are non-martyrs (mart ≤ 1) | +6 | Way of the Hermit |

### Penalties

| Condition | Penalty | Name on judgment screen |
|-----------|---------|------------------------|
| Each found-but-uncollected saint | −1 | Gluttony of the Eyes |
| Collected Wilgefortis | −2 | Apocryphal Saint Deduction |
| Collected Expeditus | −2 | Apocryphal Saint Deduction |
| Collected both Wilgefortis AND Expeditus | −6 (−2−2−2 extra) | Credulous Veneration |
| Collected Catherine (possibly fictional) | −1 | Historicity Uncertain |
| 0 martyrs in reliquary | −3 | Avoidance of Suffering |
| Found 15+ saints but collected only 7 | −8 additional | Gluttony (Mortal) |
| Found all 20 saints in a session | +5 net (+15 for thoroughness, −10 for excess) | "You Looked Upon Every Face" |

### Verdict Thresholds (adjusted for 7-slot cap)

With only 7 saints, raw base scores will be lower. Adjusted:

| Score | Verdict |
|-------|---------|
| ≥ 65 | SALVATION |
| 35–64 | PURGATORY |
| < 35 | DAMNATION |

A "perfect" min-maxed reliquary of 7 high-base, high-synergy saints with all multipliers should score in the 80–95 range. A random grab-bag of 7 should land around 40–55. Collecting poorly and eating penalties should drop below 35.

---

## Reserve Saints (for future expansion beyond 40)

These are researched and viable but don't have slots yet:

- **St. Dymphna** — patron of mental illness, beheaded by her own father. Irish princess.
- **St. Blaise** — cured a boy choking on a fishbone, patron of throats. Blessing of throats still performed with crossed candles.
- **St. Vitus** — patron of dancers, epileptics, actors. "St. Vitus' dance" (Sydenham's chorea).
- **St. Valentine** — almost nothing is reliably known about him. The romantic association is medieval fan fiction.
- **St. Mungo** — retrieved a queen's ring from a salmon's mouth, founding Glasgow. Patron of salmon.
- **St. George** — killed a dragon. Patron of England, scouting, and skin diseases. Probably didn't exist.
- **Cuthbert** (detailed above) — otters dried his feet. Ready to slot if coastal position added.
