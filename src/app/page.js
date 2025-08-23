import Link from 'next/link';
import KaraokePlayer from '../components/KaraokePlayer'; // ✅ go up to /src, then components
import { songs } from './data/songs';

export default function Home() {
  return (
    <main className="bg-white min-h-screen">
      <header className="max-w-6xl mx-auto px-6 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 shadow" />
          <span className="font-bold tracking-tight text-gray-900">KaraLearn</span>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-center leading-tight">
          Choose a <span className="text-blue-600">Song</span>
        </h1>
        <p className="text-center text-gray-500 mt-4 max-w-2xl mx-auto">
          Click a song to open the karaoke player with synced lyrics.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {songs.map((s) => (
            <Link
              key={s.slug}
              href={`/songs/${s.slug}`}
              className="group bg-gray-50 rounded-2xl p-6 shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-sm text-2xl bg-white">
                <span>{s.cover}</span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:underline">
                {s.title}
              </h3>
              <p className="text-gray-500 text-sm">{s.artist}</p>
            </Link>
          ))}
        </div>

      </section>
    </main>
  );
}
