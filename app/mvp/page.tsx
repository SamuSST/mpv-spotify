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
  const [tab, setTab] = useState<"canciones" | "playlists">("canciones");
  const [search, setSearch] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        fetchCanciones();
        fetchPlaylists();
      }
    };
    checkUser();
  }, [router]);

  const fetchCanciones = async () => {
    const { data, error } = await supabase
      .from("canciones")
      .select("*")
      .order("titulo", { ascending: true });
    if (error) setMensaje("❌ Error al cargar canciones");
    else setCanciones(data || []);
    setLoading(false);
  };

  const fetchPlaylists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("usuario_id", user.id)
      .order("nombre", { ascending: true });
    if (!error) setPlaylists(data || []);
  };

  const playSong = (song: Cancion) => {
    setCancionActual(song);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const cancionesFiltradas = canciones.filter(
    (c) =>
      c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      c.artista.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white mt-4 text-lg">Cargando Spotify...</p>
      </div>
    );

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* SIDEBAR — solo desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-[#121212] p-6 border-r border-gray-800 fixed top-0 left-0 h-full z-30">
          <h1 className="text-3xl font-bold text-green-500 mb-10">Spotify</h1>
          <div className="space-y-2">
            {[
              { label: "🎵 Canciones", value: "canciones" as const },
              { label: "📂 Playlists", value: "playlists" as const },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  tab === item.value ? "bg-green-500 text-black font-semibold" : "hover:bg-[#2a2a2a]"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => router.push("/user")}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#2a2a2a] transition"
            >
              👤 Mi perfil
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#2a2a2a] transition"
            >
              ⚙ Panel Admin
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 md:ml-64 pb-32">
          {/* HEADER */}
          <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Botón hamburguesa — solo móvil */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="md:hidden text-2xl"
              >
                ☰
              </button>

              <h2 className="text-xl sm:text-2xl font-bold flex-1">
                {tab === "canciones" ? "🎵 Canciones" : "📂 Playlists"}
              </h2>

              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#121212] border border-gray-700 px-3 py-2 rounded-full outline-none focus:border-green-500 text-sm w-36 sm:w-52 transition"
              />
            </div>

            {/* Tabs — solo móvil */}
            <div className="flex md:hidden border-t border-gray-800">
              {(["canciones", "playlists"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-semibold capitalize transition ${
                    tab === t ? "text-green-500 border-b-2 border-green-500" : "text-gray-400"
                  }`}
                >
                  {t === "canciones" ? "🎵 Canciones" : "📂 Playlists"}
                </button>
              ))}
            </div>
          </div>

          {/* Menú móvil desplegable */}
          {menuAbierto && (
            <div className="md:hidden bg-[#121212] border-b border-gray-800 px-4 py-3 flex flex-col gap-2 z-10">
              <button
                onClick={() => { router.push("/user"); setMenuAbierto(false); }}
                className="text-left px-4 py-2 rounded-lg hover:bg-[#2a2a2a] transition text-sm"
              >
                👤 Mi perfil
              </button>
              <button
                onClick={() => { router.push("/admin"); setMenuAbierto(false); }}
                className="text-left px-4 py-2 rounded-lg hover:bg-[#2a2a2a] transition text-sm"
              >
                ⚙ Panel Admin
              </button>
            </div>
          )}

          {mensaje && (
            <p className="text-center text-red-400 mt-4 text-sm">{mensaje}</p>
          )}

          {/* CANCIONES */}
          {tab === "canciones" && (
            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cancionesFiltradas.length === 0 ? (
                <p className="text-gray-400 col-span-full">No se encontraron canciones.</p>
              ) : (
                cancionesFiltradas.map((cancion) => (
                  <div
                    key={cancion.id}
                    onClick={() => playSong(cancion)}
                    className="bg-[#181818] hover:bg-[#282828] active:scale-95 transition p-3 rounded-xl cursor-pointer group"
                  >
                    <div className="relative">
                      {cancion.imagen_url ? (
                        <img
                          src={cancion.imagen_url}
                          alt={cancion.titulo}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-[#2a2a2a] rounded-lg flex items-center justify-center text-4xl">
                          🎵
                        </div>
                      )}
                      <button className="absolute bottom-2 right-2 bg-green-500 text-black w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg text-sm">
                        ▶
                      </button>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-bold text-sm truncate">{cancion.titulo}</h3>
                      <p className="text-gray-400 text-xs truncate">{cancion.artista}</p>
                      <p className="text-gray-500 text-xs truncate">{cancion.album}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PLAYLISTS */}
          {tab === "playlists" && (
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Mis Playlists</h2>
                <button
                  onClick={() => router.push("/playlist/create")}
                  className="bg-green-500 text-black px-4 py-2 rounded-full font-semibold text-sm hover:scale-105 active:scale-95 transition"
                >
                  + Crear
                </button>
              </div>

              {playlists.length === 0 ? (
                <p className="text-gray-400 text-sm">No tienes playlists creadas.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="bg-[#181818] hover:bg-[#282828] active:scale-95 transition p-3 rounded-xl cursor-pointer"
                    >
                      {playlist.imagen_url ? (
                        <img
                          src={playlist.imagen_url}
                          alt={playlist.nombre}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-[#2a2a2a] rounded-lg flex items-center justify-center text-4xl">
                          🎶
                        </div>
                      )}
                      <div className="mt-3">
                        <h3 className="font-bold text-sm truncate">{playlist.nombre}</h3>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{playlist.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* PLAYER — fixed bottom */}
      {cancionActual && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#181818]/95 backdrop-blur border-t border-gray-800 px-4 py-3 flex items-center gap-3 z-50">
          {cancionActual.imagen_url ? (
            <img
              src={cancionActual.imagen_url}
              alt={cancionActual.titulo}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-[#2a2a2a] rounded flex items-center justify-center flex-shrink-0">
              🎵
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{cancionActual.titulo}</p>
            <p className="text-gray-400 text-xs truncate">{cancionActual.artista}</p>
          </div>

          <button
            onClick={togglePlay}
            className="bg-green-500 text-black w-12 h-12 rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition flex-shrink-0"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <audio
            ref={audioRef}
            src={cancionActual.audio_url}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  );
}