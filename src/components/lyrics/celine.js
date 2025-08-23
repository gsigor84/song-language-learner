// /src/components/lyrics/celine.js
// Karaoke source: each line has a timestamp in seconds.

const RAW = [
  // ───── Intro ─────
  { time: 19.0, text: "L’histoire de ta vie" },
  { time: 22.0, text: "Elle se raconte ici" },
  { time: 24.5, text: "Dans mes bras" },

  { time: 28.0, text: "L’histoire de ma vie" },
  { time: 31.8, text: "Elle se raconte ici" },
  { time: 34.5, text: "Dans tes draps" },

  // ───── Refrain (×4) ─────
  { time: 36.2, text: "Et on apprend" },
  { time: 38.0, text: "Qu’on se ressemble plus" },
  { time: 39.5, text: "Qu’on ne le pense" },

  { time: 41.0, text: "Et on apprend" },
  { time: 43.0, text: "Qu’on se ressemble plus" },
  { time: 44.5, text: "Qu’on ne le pense" },

  { time: 46.0, text: "Et on apprend" },
  { time: 48.0, text: "Qu’on se ressemble plus" },
  { time: 49.5, text: "Qu’on ne le pense" },

  { time: 51.0, text: "Et on apprend" },
  { time: 53.0, text: "Qu’on se ressemble plus" },
  { time: 54.0, text: "Qu’on ne le pense" },

  // ───── Couplets ─────
  { time: 55.0, text: "On n’a pas dormi de la nuit" },
  { time: 60.0, text: "Pourtant je me sens bien" },
  { time: 63.0, text: "Dans cet état" },
  { time: 65.0, text: "J’ai encore de l’énergie" },
  { time: 69.0, text: "Pour revenir chez toi" },
  { time: 70.0, text: "Encore une fois" },

  { time: 74.8, text: "On peut parler de tout" },
  { time: 76.8, text: "Avec toi" },
  { time: 78.0, text: "Tu aimes les hortensias" },
  { time: 80.0, text: "Comme moi" },
  { time: 82.0, text: "On va changer le monde" },
  { time: 83.8, text: "Tu verras" },
  { time: 86.8, text: "Je crois bien que j’ai rencontré un ange" },

  // ───── Refrain (×4) — starts at 01:34 (94.0s) ─────
  { time: 94.0, text: "Et on apprend" },
  { time: 95.8, text: "Qu’on se ressemble plus" },
  { time: 97.3, text: "Qu’on ne le pense" },

  { time: 98.8, text: "Et on apprend" },
  { time: 100.8, text: "Qu’on se ressemble plus" },
  { time: 102.3, text: "Qu’on ne le pense" },

  { time: 103.8, text: "Et on apprend" },
  { time: 105.8, text: "Qu’on se ressemble plus" },
  { time: 107.3, text: "Qu’on ne le pense" },

  { time: 108.8, text: "Et on apprend" },
  { time: 110.8, text: "Qu’on se ressemble plus" },
  { time: 111.8, text: "Qu’on ne le pense" },

  // ───── Reprise “L’histoire …” — starts around 02:03 ─────
  { time: 123.0, text: "L’histoire de ta vie" },
  { time: 126.0, text: "Elle se raconte ici" },
  { time: 128.0, text: "Dans mes bras" },
  { time: 131.0, text: "L’histoire de ma vie" },
  { time: 134.0, text: "Elle se raconte ici" },
  { time: 136.0, text: "Dans tes draps" },

  // ───── “À chaque fois …” — updated timings ─────
  { time: 140.0, text: "À chaque fois que je te vois" }, // 2:20
  { time: 145.0, text: "Tu ne peux pas t’arrêter" },     // 2:25
  { time: 149.0, text: "De sourire" },                    // 2:29
  { time: 151.0, text: "À chaque fois que je te vois" },  // 2:31
  { time: 155.0, text: "Tu ne peux pas t’arrêter" },      // 2:35
  { time: 157.0, text: "De me faire rire" },              // 2:37

  // ───── Final Refrain (×4) — starts at 02:40 (160.0s) ─────
  { time: 160.0, text: "Et on apprend" },
  { time: 161.8, text: "Qu’on se ressemble plus" },
  { time: 163.3, text: "Qu’on ne le pense" },

  { time: 164.8, text: "Et on apprend" },
  { time: 166.8, text: "Qu’on se ressemble plus" },
  { time: 168.3, text: "Qu’on ne le pense" },

  { time: 169.8, text: "Et on apprend" },
  { time: 171.8, text: "Qu’on se ressemble plus" },
  { time: 173.3, text: "Qu’on ne le pense" },

  { time: 174.8, text: "Et on apprend" },
  { time: 176.8, text: "Qu’on se ressemble plus" },
  { time: 177.8, text: "Qu’on ne le pense" },
];

// ───────────────────── Utilities ─────────────────────

function applyOffset(arr, seconds = 0) {
  if (!seconds) return arr;
  return arr.map((l) => ({ ...l, time: Math.max(0, +(l.time + seconds).toFixed(3)) }));
}

function enforceMonotonic(arr) {
  if (!arr.length) return arr;
  const out = [...arr].sort((a, b) => a.time - b.time);
  for (let i = 1; i < out.length; i++) {
    if (out[i].time <= out[i - 1].time) out[i].time = +(out[i - 1].time + 0.01).toFixed(3);
  }
  return out;
}

function normaliseText(s) {
  return s.replace(/'/g, "’").replace(/\s+/g, " ").trim();
}

function prepare(arr, offsetSec = 0) {
  const cleaned = arr.map((l) => ({
    time: Number(l.time),
    text: normaliseText(l.text || ""),
  }));
  return enforceMonotonic(applyOffset(cleaned, offsetSec));
}

// tweak global offset if needed (e.g., -0.20)
export const lyrics = prepare(RAW, 0);
