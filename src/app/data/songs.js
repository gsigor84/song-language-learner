// /src/app/data/songs.js
export const songs = [
  {
    slug: 'celine',
    title: "L’histoire de ta vie",
    artist: 'Céline Dessberg',
    audio: '/lhistoire-de-ta-vie.mp3',
    cover: '🎤',
    accent: '#2563eb',
  },
  {
    slug: 'la-vie-en-rose',
    title: 'La Vie En Rose',
    artist: 'Édith Piaf',
    // Use your current filename in /public:
    audio: '/Laura _Anton-_La_Vie_En_Rose_.mp3',
    cover: '🌹',
    accent: '#e11d48',
  },
];
export function getSong(slug) {
  return songs.find((s) => s.slug === slug);
}
