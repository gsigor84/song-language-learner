'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// ---------- helpers ----------
const findActiveIndex = (arr, t) => {
  if (!arr.length) return 0;
  let lo = 0, hi = arr.length - 1, ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid].time <= t) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  return ans;
};

const tokenize = (text) => text.match(/\S+\s*|\s+/g) || [];
const tokenWeight = (tok) => tok.trim().length;

// normalize French word -> key used in similarities
const stripPunct = (s) => s.replace(/[.,!?;:()"“”«»…]/g, '');
const rmAccents  = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
const lower      = (s) => s.toLowerCase();
const stripL     = (s) => s.replace(/^(l’|l')/i, '');
const normWord   = (w) => stripL(lower(rmAccents(stripPunct(w.trim()))));

const SIMILAR_COLOR = '#dc2626'; // red-600

// map each lyric line to nearest translation time (for full-line translation)
const buildTransIndexMap = (lyrics, translations) => {
  if (!lyrics.length || !translations.length) return [];
  const tTimes = translations.map(t => +t.time);
  let j = 0;
  const out = [];
  for (let i = 0; i < lyrics.length; i++) {
    const t = +lyrics[i].time;
    while (j < tTimes.length - 1 && Math.abs(tTimes[j + 1] - t) <= Math.abs(tTimes[j] - t)) j++;
    out.push(j);
  }
  return out;
};

// ---------- word renderer (now similarity-aware & clickable) ----------
function WordLine({
  text,
  progress,
  accent = '#2563eb',
  className = '',
  inactiveColor = '#374151',
  similarities = {},
  targetLang = 'pt',
  onWordClick,   // (word, event) => void
}) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const total  = useMemo(() => tokens.reduce((s, t) => s + tokenWeight(t), 0) || 1, [tokens]);
  let remaining = progress * total;

  return (
    <span className={className} style={{ color: inactiveColor }}>
      {tokens.map((tok, i) => {
        const w = tokenWeight(tok);
        const isWord = tok.trim().length > 0;

        // determine if this token has a similarity entry
        const key = isWord ? normWord(tok) : '';
        const simEntry = key && similarities[key];
        // we highlight if entry exists for current target language OR any language
        const hasSimilar = !!simEntry && (simEntry[targetLang] || simEntry.en || simEntry.pt || simEntry.es);

        // progress fill
        const done = w === 0 ? 0 : Math.max(0, Math.min(1, remaining / w));
        if (w) remaining -= w;

        // style decisions:
        // - fully unfilled: similar -> red text; normal words -> inherit
        // - partially filled: gradient from accent (filled) to red (if similar) or gray (if not)
        // - fully filled: accent color; keep dotted underline if similar
        if (done >= 1) {
          const styleFilled = hasSimilar
            ? { color: accent, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '4px' }
            : { color: accent };
          return isWord ? (
            hasSimilar ? (
              <span
                key={i}
                style={styleFilled}
                className="cursor-pointer"
                onClick={(e) => onWordClick?.(tok, e)}
                title="See similarity"
              >
                {tok}
              </span>
            ) : (
              <span key={i}>{tok}</span>
            )
          ) : (
            <span key={i}>{tok}</span>
          );
        }

        if (done <= 0) {
          const styleIdle = hasSimilar
            ? { color: SIMILAR_COLOR, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '4px' }
            : {};
          return isWord ? (
            hasSimilar ? (
              <span
                key={i}
                style={styleIdle}
                className="cursor-pointer"
                onClick={(e) => onWordClick?.(tok, e)}
                title="See similarity"
              >
                {tok}
              </span>
            ) : (
              <span key={i}>{tok}</span>
            )
          ) : (
            <span key={i}>{tok}</span>
          );
        }

        // partially filled
        const pct = (done * 100).toFixed(2) + '%';
        const rightColor = hasSimilar ? SIMILAR_COLOR : 'rgba(0,0,0,0.35)';
        const styleActive = {
          backgroundImage: `linear-gradient(90deg, ${accent} ${pct}, ${rightColor} ${pct})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          textDecoration: hasSimilar ? 'underline' : undefined,
          textDecorationStyle: hasSimilar ? 'dotted' : undefined,
          textUnderlineOffset: hasSimilar ? '4px' : undefined,
        };
        return isWord ? (
          hasSimilar ? (
            <span
              key={i}
              style={styleActive}
              className="cursor-pointer"
              onClick={(e) => onWordClick?.(tok, e)}
              title="See similarity"
            >
              {tok}
            </span>
          ) : (
            <span key={i} style={styleActive}>{tok}</span>
          )
        ) : (
          <span key={i} style={styleActive}>{tok}</span>
        );
      })}
    </span>
  );
}

// ---------- main component ----------
export default function KaraokePlayer({
  lyrics = [],
  translations = [],   // optional: for full-line translation bubble
  similarities = {},   // NEW
  audioUrl = '',
  defaultAccent = '#2563eb',
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [mode, setMode] = useState('stage');
  const [fontPx, setFontPx] = useState(36);
  const [lineH, setLineH] = useState(1.25);
  const [accent, setAccent] = useState(defaultAccent);
  const [wordMode, setWordMode] = useState(true);
  const [openTransIdx, setOpenTransIdx] = useState(null);
  const [targetLang, setTargetLang] = useState('pt'); // which language to pull from similarities
  const [popover, setPopover] = useState(null); // {x,y,fr,trans,meaning,lang}

  const audioRef = useRef(null);

  const activeIndex = useMemo(() => findActiveIndex(lyrics, currentTime), [lyrics, currentTime]);
  const nextTime     = (i) => (i < lyrics.length - 1 ? lyrics[i + 1].time : lyrics[i].time + 2);
  const lineProgress = (i) => {
    if (!lyrics.length) return 0;
    const start = lyrics[i].time;
    const end   = nextTime(i);
    const span  = Math.max(0.12, end - start);
    return Math.min(1, Math.max(0, (currentTime - start) / span));
  };

  // auto-scroll in scroll mode
  const lineRefs = useRef([]);
  useEffect(() => {
    if (mode !== 'scroll') return;
    const el = lineRefs.current[activeIndex];
    if (el?.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIndex, mode]);

  const onTime = (e) => setCurrentTime(e.target.currentTime || 0);

  const activeFillStyle = (progress) => ({
    backgroundImage: `linear-gradient(90deg, ${accent} ${progress * 100}%, rgba(0,0,0,0.35) ${progress * 100}%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  });

  // full-line translation mapping (optional)
  const transIndexMap = useMemo(() => buildTransIndexMap(lyrics, translations), [lyrics, translations]);
  const getLineTranslation = (i) => {
    if (!translations.length || !transIndexMap.length) return null;
    const j = transIndexMap[i];
    return translations[j]?.text || null;
  };

  // pause + toggle line translation bubble
  const onToggleLineTranslation = (i) => {
    audioRef.current?.pause();
    setOpenTransIdx((v) => (v === i ? null : i));
    setPopover(null); // hide word popover if open
  };

  // lookup a single word in similarities for current targetLang
  const lookupWord = (rawWord) => {
    const key = normWord(rawWord);
    if (!key) return null;
    const entry = similarities[key];
    if (!entry) return null;
    const pick = entry[targetLang] || entry.en || entry.pt || entry.es;
    if (!pick) return null;
    return { base: key, ...pick, lang: targetLang.toUpperCase() };
  };

  // clicking a word: pause + show popover (if known)
  const onWordClick = (word, e) => {
    audioRef.current?.pause();
    const match = lookupWord(word);
    if (!match) { setPopover(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      fr: word,
      trans: match.translation,
      meaning: match.meaning,
      lang: match.lang,
    });
  };

  return (
    <div className="relative bg-gray-50 rounded-2xl shadow p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <audio
          ref={audioRef}
          controls
          src={encodeURI(audioUrl)}
          onTimeUpdate={onTime}
          className="min-w-[260px]"
          preload="metadata"
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-white border border-gray-300 rounded-full px-3 py-1 text-sm shadow-sm"
          >
            <option value="stage">Stage</option>
            <option value="scroll">Scroll</option>
          </select>
        </div>

        {mode === 'stage' && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Font</label>
              <input type="range" min="22" max="60" step="1" value={fontPx}
                onChange={(e) => setFontPx(parseInt(e.target.value, 10))} />
              <span className="text-xs text-gray-500">{fontPx}px</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Line height</label>
              <input type="range" min="1.0" max="1.8" step="0.05" value={lineH}
                onChange={(e) => setLineH(parseFloat(e.target.value))} />
              <span className="text-xs text-gray-500">{lineH.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Accent</label>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="w-8 h-8 p-0 bg-transparent border border-gray-300 rounded"
            title="Karaoke highlight color"
          />
        </div>

        {/* language for similarities */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-700">Glossary</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-white border border-gray-300 rounded-full px-3 py-1 text-sm shadow-sm"
            title="Target language for similar words"
          >
            <option value="pt">Português</option>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Display */}
      {!lyrics.length ? (
        <p className="text-red-600">No lyrics loaded…</p>
      ) : mode === 'stage' ? (
        <StageView
          lyrics={lyrics}
          activeIndex={activeIndex}
          lineProgress={lineProgress}
          activeFillStyle={activeFillStyle}
          fontPx={fontPx}
          lineH={lineH}
          accent={accent}
          wordMode={wordMode}
          getLineTranslation={getLineTranslation}
          openTransIdx={openTransIdx}
          onToggleLineTranslation={onToggleLineTranslation}
          onWordClick={onWordClick}
          similarities={similarities}
          targetLang={targetLang}
        />
      ) : (
        <ScrollView
          lyrics={lyrics}
          activeIndex={activeIndex}
          lineRefs={lineRefs}
          lineProgress={lineProgress}
          activeFillStyle={activeFillStyle}
          accent={accent}
          wordMode={wordMode}
          getLineTranslation={getLineTranslation}
          openTransIdx={openTransIdx}
          onToggleLineTranslation={onToggleLineTranslation}
          onWordClick={onWordClick}
          similarities={similarities}
          targetLang={targetLang}
        />
      )}

      {/* Word popover */}
      {popover && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full"
          style={{ left: popover.x, top: popover.y }}
          onClick={() => setPopover(null)}
        >
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
            <div className="font-semibold text-gray-900">{popover.fr}</div>
            <div className="text-gray-700">
              <span className="uppercase text-xs mr-1 text-gray-500">{popover.lang}</span>
              {popover.trans}
            </div>
            <div className="text-gray-500 text-xs">{popover.meaning}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- subviews ----------
function StageView({
  lyrics, activeIndex, lineProgress, activeFillStyle, fontPx, lineH, accent, wordMode,
  getLineTranslation, openTransIdx, onToggleLineTranslation, onWordClick, similarities, targetLang
}) {
  const prev = lyrics[activeIndex - 1]?.text ?? '';
  const curr = lyrics[activeIndex]?.text ?? '';
  const next = lyrics[activeIndex + 1]?.text ?? '';
  const progress = lineProgress(activeIndex);
  const trans = getLineTranslation(activeIndex);

  return (
    <div className="flex flex-col items-center justify-center min-h-[46vh] text-center select-none">
      <div className="opacity-70 mb-3 text-gray-700" style={{ fontSize: Math.round(fontPx * 0.6), lineHeight: lineH }}>
        {prev}
      </div>

      <button
        onClick={() => onToggleLineTranslation(activeIndex)}
        className="font-extrabold mb-2 focus:outline-none"
        style={{ fontSize: fontPx, lineHeight: lineH }}
        title="Show translation"
      >
        {wordMode ? (
          <WordLine
            text={curr}
            progress={progress}
            accent={accent}
            similarities={similarities}
            targetLang={targetLang}
            onWordClick={(w, e) => { e.stopPropagation(); onWordClick(w, e); }}
          />
        ) : (
          <span style={activeFillStyle(progress)}>{curr}</span>
        )}
      </button>

      {openTransIdx === activeIndex && trans && (
        <div className="mt-2 max-w-2xl bg-yellow-50 border border-yellow-200 text-gray-800 rounded-xl px-4 py-2 shadow-sm">
          {trans}
        </div>
      )}

      <div className="opacity-80 text-gray-700 mt-3" style={{ fontSize: Math.round(fontPx * 0.6), lineHeight: lineH }}>
        {next}
      </div>
    </div>
  );
}

function ScrollView({
  lyrics, activeIndex, lineRefs, lineProgress, activeFillStyle, accent, wordMode,
  getLineTranslation, openTransIdx, onToggleLineTranslation, onWordClick, similarities, targetLang
}) {
  return (
    <div className="max-h-80 overflow-y-auto p-4 rounded-xl bg-white border border-gray-200">
      {lyrics.map((line, i) => {
        const isActive = i === activeIndex;
        const progress = lineProgress(i);
        const baseCls = 'my-2 text-lg transition-colors cursor-pointer ' + (isActive ? 'font-bold' : 'text-gray-800');
        const trans = getLineTranslation(i);

        return (
          <div key={i} ref={(el) => (lineRefs.current[i] = el)} className="mb-2">
            <p className={baseCls} onClick={() => onToggleLineTranslation(i)} title="Show translation">
              {wordMode ? (
                <WordLine
                  text={line.text}
                  progress={isActive ? progress : 0}
                  accent={accent}
                  similarities={similarities}
                  targetLang={targetLang}
                  onWordClick={(w, e) => { e.stopPropagation(); onWordClick(w, e); }}
                />
              ) : isActive ? (
                <span style={activeFillStyle(progress)}>{line.text}</span>
              ) : (
                line.text
              )}
            </p>
            {openTransIdx === i && trans && (
              <div className="ml-2 mt-1 inline-block bg-yellow-50 border border-yellow-200 text-gray-800 rounded-lg px-3 py-1 text-sm shadow-sm">
                {trans}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
