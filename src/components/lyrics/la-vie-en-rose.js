// /src/components/lyrics/la-vie-en-rose.js
// La Vie En Rose — refined timings (absolute seconds, no global offset)

const RAW = [
  // ── Opening verse (first vocal ~13s) ──
  { time: 13.000, text: "Des yeux qui font baisser les miens" },
  { time: 17.000, text: "Un rire qui se perd sur sa bouche" },
  { time: 21.000, text: "Voilà le portrait sans retouche" },
  { time: 25.000, text: "De l’homme auquel j’appartiens" },

  { time: 31.000, text: "Quand il me prend dans ses bras" },

  // ── Early refrain chunk (your refined windows) ──
  { time: 36.214, text: "Il me parle tout bas" },              // 36–38
  { time: 38.000, text: "Je vois la vie en rose" },            // 38–41

  { time: 43.000, text: "Il me dit des mots d’amour" },        // 43–46
  { time: 47.286, text: "Des mots de tous les jours" },        // 47–49
  { time: 49.071, text: "Et ça me fait quelque chose" },       // 49–52

  { time: 54.071, text: "Il est entré dans mon cœur" },        // 54–58
  { time: 58.000, text: "Une part de bonheur" },               // 58–60
  { time: 60.143, text: "Dont je connais la cause" },          // 60–64

  { time: 66.214, text: "C’est lui pour moi, moi pour lui, dans la vie" }, // 1:06–1:10
  { time: 71.214, text: "Il me l’a dit, l’a juré pour la vie" },           // 1:11–1:17

  { time: 77.286, text: "Et dès que je l’aperçois" },          // 1:17–1:20
  { time: 81.214, text: "Alors je sens en moi" },              // 1:21–1:23
  { time: 83.000, text: "Mon cœur qui bat" },                  // 1:23–1:28

  // ── This block per your new windows ──
  { time: 90.143, text: "Des nuits d’amour à plus finir" },    // ends ~1:33
  { time: 94.286, text: "Un grand bonheur qui prend sa place" },   // 1:34–1:37
  { time: 97.286, text: "Des ennuis, des chagrins, s’effacent" },  // 1:37–1:40
  { time: 101.214, text: "Heureux, heureux à en mourir" },         // 1:41–1:46

  { time: 110.000, text: "Quand il me prend dans ses bras" },  // 1:50–1:53
  { time: 114.000, text: "Il me parle tout bas" },             // 1:53–1:56
  { time: 117.500, text: "Je vois la vie en rose" },           // 1:57–1:59 (section ends ~2:00)

  // ── After 2:00 (your windows) ──
  { time: 121.000, text: "Il me dit des mots d’amour" },       // 2:01–2:04
  { time: 125.143, text: "Des mots de tous les jours" },       // 2:05–2:07
  { time: 128.214, text: "Et ça me fait quelque chose" },      // 2:08–2:10

  { time: 132.214, text: "Il est entré dans mon cœur" },       // 2:12–2:16
  { time: 136.000, text: "Une part de bonheur" },              // 2:16–2:18
  { time: 138.214, text: "Dont je connais la cause" },         // 2:18–2:23

  { time: 144.214, text: "C’est toi pour moi, moi pour toi dans la vie" }, // 2:24–2:28
  { time: 149.286, text: "Il me l’a dit, l’a juré pour la vie" },          // 2:29–2:34
  { time: 155.143, text: "Et dès que je t’aperçois" },         // 2:35–2:38
  { time: 158.214, text: "Alors je sens en moi" },             // 2:38–2:40
  { time: 161.071, text: "Mon cœur qui bat" },                 // 2:41–2:45

  // small outro scat (placed after “Mon cœur qui bat”)
  { time: 165.214, text: "Lalala, lala" },
  { time: 167.357, text: "Lala, lala" },
];

// ── Utilities: normalize + keep times strictly increasing ──
function enforceMonotonic(arr) {
  if (!arr.length) return arr;
  const out = [...arr].sort((a, b) => a.time - b.time);
  for (let i = 1; i < out.length; i++) {
    if (out[i].time <= out[i - 1].time) {
      out[i].time = +(out[i - 1].time + 0.01).toFixed(3);
    }
  }
  return out;
}
function normaliseText(s) {
  return s.replace(/'/g, "’").replace(/\s+/g, " ").trim();
}
function prepare(arr) {
  const cleaned = arr.map((l) => ({ time: Number(l.time), text: normaliseText(l.text || "") }));
  return enforceMonotonic(cleaned);
}

export const lyrics = prepare(RAW);
