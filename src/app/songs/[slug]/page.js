import { notFound } from 'next/navigation';
import KaraokePlayer from '../../../components/KaraokePlayer';
import { getSong } from '../../data/songs';

const lyricLoaders = {
  celine: () => import('../../../components/lyrics/celine'),
  'la-vie-en-rose': () => import('../../../components/lyrics/la-vie-en-rose'),
};
const translationLoaders = {
  celine: () => import('../../../components/lyrics/celine.pt'),
  'la-vie-en-rose': () => import('../../../components/lyrics/la-vie-en-rose.pt'),
};
const similarityLoaders = {
  celine: () => import('../../../components/lyrics/celine.similarities'),
  'la-vie-en-rose': () => import('../../../components/lyrics/la-vie-en-rose.similarities'),
};

export default async function SongPage({ params }) {
  const song = getSong(params.slug);
  if (!song) notFound();

  const [lyricsMod, transMod, simMod] = await Promise.all([
    lyricLoaders[params.slug]?.(),
    translationLoaders[params.slug]?.(),
    similarityLoaders[params.slug]?.(),
  ]);

  if (!lyricsMod) notFound();

  const lyrics = lyricsMod.lyrics || [];
  const translations = transMod?.translations || [];
  const similarities = simMod?.similarities || {};

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <a href="/" className="text-sm text-gray-500 hover:underline">← Back</a>
        <div className="mt-6">
          <KaraokePlayer
            lyrics={lyrics}
            translations={translations}
            similarities={similarities}
            audioUrl={song.audio}
            defaultAccent={song.accent}
          />
        </div>
      </div>
    </main>
  );
}
