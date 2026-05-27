"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Cancion {
  id: string;
  titulo: string;
  artista: string;
  album: string;
  duracion: string;
  imagen_url: string;
  audio_url: string;
}

interface Playlist {
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string;
}

export default function MVPPage() {
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [cancionActual, setCancionActual] = useState<Cancion | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"home" | "search" | "library">("home");
  const [search, setSearch] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [duracionTotal, setDuracionTotal] = useState(0);
  const [volumen, setVolumen] = useState(1);
  const [playerExpandido, setPlayerExpandido] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else { fetchCanciones(); fetchPlaylists(); }
    };
    checkUser();
  }, [router]);

  const fetchCanciones = async () => {
    const { data, error } = await supabase.from("canciones").select("*").order("titulo", { ascending: true });
    if (error) setMensaje("❌ Error al cargar canciones");
    else setCanciones(data || []);
    setLoading(false);
  };

  const fetchPlaylists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("playlists").select("*").eq("usuario_id", user.id).order("nombre", { ascending: true });
    if (!error) setPlaylists(data || []);
  };

  const playSong = (song: Cancion) => {
    setCancionActual(song);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = song.audio_url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 50);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const siguienteCancion = () => {
    if (!cancionActual) return;
    const idx = canciones.findIndex(c => c.id === cancionActual.id);
    const siguiente = canciones[(idx + 1) % canciones.length];
    playSong(siguiente);
  };

  const anteriorCancion = () => {
    if (!cancionActual) return;
    const idx = canciones.findIndex(c => c.id === cancionActual.id);
    const anterior = canciones[(idx - 1 + canciones.length) % canciones.length];
    playSong(anterior);
  };

  const cancionesFiltradas = canciones.filter(c =>
    c.titulo.toLowerCase().includes(search.toLowerCase()) ||
    c.artista.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm font-medium tracking-widest uppercase">Cargando</p>
      </div>
    );

  // PLAYER EXPANDIDO (pantalla completa móvil)
  if (playerExpandido && cancionActual) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-black flex flex-col z-50">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <button onClick={() => setPlayerExpandido(false)} className="text-white/70 hover:text-white transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <p className="text-white/80 text-xs font-semibold tracking-widest uppercase">Reproduciendo</p>
          <button className="text-white/70">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>

        {/* Album art */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
            {cancionActual.imagen_url ? (
              <img src={cancionActual.imagen_url} alt={cancionActual.titulo} className={`w-full h-full object-cover transition-all duration-300 ${isPlaying ? "scale-105" : "scale-100"}`} />
            ) : (
              <div className="w-full h-full bg-[#282828] flex items-center justify-center text-7xl">🎵</div>
            )}
          </div>
        </div>

        {/* Info + like */}
        <div className="px-8 pb-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-xl truncate">{cancionActual.titulo}</h2>
            <p className="text-white/50 text-sm mt-0.5 truncate">{cancionActual.artista}</p>
          </div>
          <button className="ml-4 text-[#1DB954]">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-8 pb-4">
          <input
            type="range" min={0} max={duracionTotal || 100} value={progreso}
            onChange={(e) => {
              const v = Number(e.target.value);
              setProgreso(v);
              if (audioRef.current) audioRef.current.currentTime = v;
            }}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #1DB954 ${(progreso / (duracionTotal || 1)) * 100}%, #4d4d4d ${(progreso / (duracionTotal || 1)) * 100}%)` }}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-white/40 text-xs">{formatTime(progreso)}</span>
            <span className="text-white/40 text-xs">{formatTime(duracionTotal)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 pb-6 flex items-center justify-between">
          <button onClick={anteriorCancion} className="text-white/70 hover:text-white transition p-2">
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
          >
            {isPlaying ? (
              <svg width="24" height="24" fill="black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="24" height="24" fill="black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={siguienteCancion} className="text-white/70 hover:text-white transition p-2">
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 4V8l-5.5 4zM16 6h2v12h-2z"/>
            </svg>
          </button>
        </div>

        {/* Volume */}
        <div className="px-8 pb-10 flex items-center gap-3">
          <svg width="16" height="16" fill="white" className="opacity-40" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm7-.17v6.34L9.83 13H7v-2h2.83L12 8.83z"/></svg>
          <input
            type="range" min={0} max={1} step={0.01} value={volumen}
            onChange={(e) => { const v = Number(e.target.value); setVolumen(v); if (audioRef.current) audioRef.current.volume = v; }}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, white ${volumen * 100}%, #4d4d4d ${volumen * 100}%)` }}
          />
          <svg width="16" height="16" fill="white" className="opacity-40" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={() => setProgreso(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuracionTotal(audioRef.current?.duration || 0)}
          onEnded={siguienteCancion}
        />
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col max-w-md mx-auto relative">

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto pb-36">

        {/* HOME */}
        {tab === "home" && (
          <div>
            {/* Header degradado */}
            <div className="bg-gradient-to-b from-[#1a3a2a] to-black px-5 pt-14 pb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Buenas tardes</h1>
                <div className="flex gap-3">
                  <button onClick={() => router.push("/user")} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                  </button>
                  <button onClick={() => router.push("/admin")} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                  </button>
                </div>
              </div>

              {/* Recientes — grid 2 cols */}
              <div className="grid grid-cols-2 gap-3">
                {canciones.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => playSong(c)}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg overflow-hidden transition"
                  >
                    {c.imagen_url ? (
                      <img src={c.imagen_url} alt={c.titulo} className="w-12 h-12 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-[#333] flex items-center justify-center text-xl flex-shrink-0">🎵</div>
                    )}
                    <span className="text-xs font-semibold truncate pr-2">{c.titulo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sección — Todas las canciones */}
            <div className="px-5 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Todas las canciones</h2>
                <button onClick={() => setTab("search")} className="text-[#1DB954] text-xs font-semibold">Ver todo</button>
              </div>
              <div className="flex flex-col gap-3">
                {canciones.slice(0, 8).map((cancion) => (
                  <button
                    key={cancion.id}
                    onClick={() => playSong(cancion)}
                    className="flex items-center gap-4 hover:bg-white/5 active:bg-white/10 rounded-lg p-2 -mx-2 transition"
                  >
                    {cancion.imagen_url ? (
                      <img src={cancion.imagen_url} alt={cancion.titulo} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center text-2xl flex-shrink-0">🎵</div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-semibold truncate ${cancionActual?.id === cancion.id ? "text-[#1DB954]" : "text-white"}`}>{cancion.titulo}</p>
                      <p className="text-white/50 text-xs truncate">{cancion.artista}</p>
                    </div>
                    {cancionActual?.id === cancion.id && isPlaying && (
                      <div className="flex gap-0.5 items-end h-4 flex-shrink-0">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-0.5 bg-[#1DB954] rounded-full animate-pulse" style={{height: `${[60,100,40][i-1]}%`, animationDelay: `${i*0.15}s`}} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Playlists */}
            {playlists.length > 0 && (
              <div className="px-5 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Tus playlists</h2>
                  <button onClick={() => setTab("library")} className="text-[#1DB954] text-xs font-semibold">Ver todo</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {playlists.map((pl) => (
                    <div key={pl.id} className="flex-shrink-0 w-36">
                      {pl.imagen_url ? (
                        <img src={pl.imagen_url} alt={pl.nombre} className="w-36 h-36 rounded-lg object-cover" />
                      ) : (
                        <div className="w-36 h-36 bg-[#282828] rounded-lg flex items-center justify-center text-4xl">🎶</div>
                      )}
                      <p className="text-xs font-semibold mt-2 truncate">{pl.nombre}</p>
                      <p className="text-white/40 text-xs truncate">{pl.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEARCH */}
        {tab === "search" && (
          <div className="px-5 pt-14 pb-4">
            <h1 className="text-2xl font-bold mb-5">Buscar</h1>
            <div className="relative mb-6">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-black" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Artistas, canciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white text-black placeholder-gray-500 pl-10 pr-4 py-3 rounded-lg text-sm font-medium outline-none"
                autoFocus
              />
            </div>

            {search ? (
              <div className="flex flex-col gap-3">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Resultados</p>
                {cancionesFiltradas.length === 0 ? (
                  <p className="text-white/40 text-sm">Sin resultados para "{search}"</p>
                ) : cancionesFiltradas.map((cancion) => (
                  <button
                    key={cancion.id}
                    onClick={() => playSong(cancion)}
                    className="flex items-center gap-4 hover:bg-white/5 active:bg-white/10 rounded-lg p-2 -mx-2 transition"
                  >
                    {cancion.imagen_url ? (
                      <img src={cancion.imagen_url} alt={cancion.titulo} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center text-2xl flex-shrink-0">🎵</div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold truncate">{cancion.titulo}</p>
                      <p className="text-white/50 text-xs truncate">{cancion.artista} · {cancion.album}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Explorar categorías</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Salsa", color: "from-orange-600 to-red-700", emoji: "💃" },
                    { label: "Reggaeton", color: "from-purple-600 to-pink-700", emoji: "🔥" },
                    { label: "Rock Latino", color: "from-blue-600 to-indigo-700", emoji: "🎸" },
                    { label: "Bachata", color: "from-green-600 to-teal-700", emoji: "🎺" },
                    { label: "Vallenato", color: "from-yellow-500 to-orange-600", emoji: "🪗" },
                    { label: "Pop", color: "from-pink-500 to-rose-600", emoji: "⭐" },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => setSearch(cat.label)}
                      className={`bg-gradient-to-br ${cat.color} rounded-lg p-4 text-left h-20 relative overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition`}
                    >
                      <span className="font-bold text-sm">{cat.label}</span>
                      <span className="absolute -bottom-1 -right-1 text-4xl opacity-80">{cat.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIBRARY */}
        {tab === "library" && (
          <div className="px-5 pt-14 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Tu biblioteca</h1>
              <button
                onClick={() => router.push("/playlist/create")}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
            </div>

            {/* Todas las canciones como lista */}
            <div className="mb-6">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Canciones guardadas</p>
              <div className="flex flex-col gap-1">
                {canciones.map((cancion, i) => (
                  <button
                    key={cancion.id}
                    onClick={() => playSong(cancion)}
                    className="flex items-center gap-4 hover:bg-white/5 active:bg-white/10 rounded-lg px-2 py-2 transition"
                  >
                    <span className="text-white/30 text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
                    {cancion.imagen_url ? (
                      <img src={cancion.imagen_url} alt={cancion.titulo} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center text-xl flex-shrink-0">🎵</div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-medium truncate ${cancionActual?.id === cancion.id ? "text-[#1DB954]" : "text-white"}`}>{cancion.titulo}</p>
                      <p className="text-white/40 text-xs truncate">{cancion.artista}</p>
                    </div>
                    <span className="text-white/30 text-xs flex-shrink-0">{cancion.duracion}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Playlists */}
            {playlists.length > 0 && (
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Playlists</p>
                <div className="flex flex-col gap-1">
                  {playlists.map((pl) => (
                    <div key={pl.id} className="flex items-center gap-4 px-2 py-2 rounded-lg hover:bg-white/5 transition">
                      {pl.imagen_url ? (
                        <img src={pl.imagen_url} alt={pl.nombre} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-2xl flex-shrink-0">🎶</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pl.nombre}</p>
                        <p className="text-white/40 text-xs">Playlist · {pl.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MINI PLAYER */}
      {cancionActual && (
        <div
          className="fixed left-0 right-0 z-40 px-3 max-w-md mx-auto"
          style={{ bottom: "calc(64px + 8px)" }}
        >
          <div
            onClick={() => setPlayerExpandido(true)}
            className="bg-[#1e1e1e] rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl cursor-pointer active:scale-[0.99] transition border border-white/5"
          >
            {cancionActual.imagen_url ? (
              <img src={cancionActual.imagen_url} alt={cancionActual.titulo} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-[#333] rounded-lg flex items-center justify-center flex-shrink-0">🎵</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{cancionActual.titulo}</p>
              <p className="text-white/50 text-xs truncate">{cancionActual.artista}</p>
            </div>
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button onClick={anteriorCancion} className="text-white/70 hover:text-white transition">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <button onClick={togglePlay} className="text-white hover:text-[#1DB954] transition">
                {isPlaying ? (
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button onClick={siguienteCancion} className="text-white/70 hover:text-white transition">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/></svg>
              </button>
            </div>
          </div>
          {/* Progress bar mini */}
          <div className="h-0.5 bg-white/10 rounded-full mt-0.5 mx-1">
            <div
              className="h-full bg-[#1DB954] rounded-full transition-all"
              style={{ width: `${duracionTotal ? (progreso / duracionTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0a] border-t border-white/10 flex z-50">
        {[
          { id: "home", label: "Inicio", icon: (active: boolean) => (
            <svg width="24" height="24" fill={active ? "white" : "none"} stroke={active ? "white" : "rgba(255,255,255,0.5)"} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
            </svg>
          )},
          { id: "search", label: "Buscar", icon: (active: boolean) => (
            <svg width="24" height="24" fill="none" stroke={active ? "white" : "rgba(255,255,255,0.5)"} strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          )},
          { id: "library", label: "Tu biblioteca", icon: (active: boolean) => (
            <svg width="24" height="24" fill="none" stroke={active ? "white" : "rgba(255,255,255,0.5)"} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8 6H21M8 12H21M8 18H21M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
          )},
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as typeof tab)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition"
          >
            {item.icon(tab === item.id)}
            <span className={`text-[10px] font-medium ${tab === item.id ? "text-white" : "text-white/50"}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      <audio
        ref={audioRef}
        onTimeUpdate={() => setProgreso(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuracionTotal(audioRef.current?.duration || 0)}
        onEnded={siguienteCancion}
      />

      {mensaje && (
        <div className="fixed top-4 left-4 right-4 bg-red-500/90 text-white text-sm text-center py-3 rounded-xl z-50 max-w-md mx-auto">
          {mensaje}
        </div>
      )}
    </div>
  );
}