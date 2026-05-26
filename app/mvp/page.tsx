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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const router = useRouter();

  // 🔒 Verificar sesión
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

  // 🎵 Obtener canciones
  const fetchCanciones = async () => {
    const { data, error } = await supabase
      .from("canciones")
      .select("*")
      .order("titulo", { ascending: true });

    if (error) {
      setMensaje("❌ Error al cargar canciones");
    } else {
      setCanciones(data || []);
    }

    setLoading(false);
  };

  // 📂 Obtener playlists del usuario
  const fetchPlaylists = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("usuario_id", user.id)
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error.message);
    } else {
      setPlaylists(data || []);
    }
  };

  // ▶ Reproducir canción
  const playSong = (song: Cancion) => {
    setCancionActual(song);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  // ⏸ Play / Pause
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

  // 🔍 Filtrar canciones
  const cancionesFiltradas = canciones.filter(
    (c) =>
      c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      c.artista.toLowerCase().includes(search.toLowerCase())
  );

  // ⏳ Loading bonito
  if (loading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-lg">Cargando Spotify...</p>
      </div>
    );

  return (
    <div className="bg-black text-white min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#121212] p-6 border-r border-gray-800">
        <h1 className="text-3xl font-bold text-green-500 mb-10">
          Spotify
        </h1>

        <div className="space-y-4">
          <button
            onClick={() => setTab("canciones")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              tab === "canciones"
                ? "bg-green-500 text-black"
                : "hover:bg-[#2a2a2a]"
            }`}
          >
            🎵 Canciones
          </button>

          <button
            onClick={() => setTab("playlists")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              tab === "playlists"
                ? "bg-green-500 text-black"
                : "hover:bg-[#2a2a2a]"
            }`}
          >
            📂 Playlists
          </button>

          <button
            onClick={() => router.push("/user")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#2a2a2a]"
          >
            👤 Mi perfil
          </button>

          <button
            onClick={() => router.push("/admin")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#2a2a2a]"
          >
            ⚙ Panel Admin
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 pb-32">
        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md p-4 border-b border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <h2 className="text-3xl font-bold">
              {tab === "canciones" ? "Canciones" : "Playlists"}
            </h2>

            <input
              type="text"
              placeholder="Buscar canciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121212] border border-gray-700 px-4 py-2 rounded-full outline-none focus:border-green-500"
            />
          </div>
        </div>

        {mensaje && (
          <p className="text-center text-red-400 mt-4">{mensaje}</p>
        )}

        {/* CANCIONES */}
        {tab === "canciones" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cancionesFiltradas.length === 0 ? (
              <p className="text-gray-400">
                No se encontraron canciones.
              </p>
            ) : (
              cancionesFiltradas.map((cancion) => (
                <div
                  key={cancion.id}
                  onClick={() => playSong(cancion)}
                  className="bg-[#181818] hover:bg-[#282828] transition p-4 rounded-xl cursor-pointer group"
                >
                  <div className="relative">
                    {cancion.imagen_url ? (
                      <img
                        src={cancion.imagen_url}
                        alt={cancion.titulo}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-[#2a2a2a] rounded-lg flex items-center justify-center text-5xl">
                        🎵
                      </div>
                    )}

                    <button className="absolute bottom-3 right-3 bg-green-500 text-black w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg">
                      ▶
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-bold truncate">
                      {cancion.titulo}
                    </h3>

                    <p className="text-gray-400 text-sm truncate">
                      {cancion.artista}
                    </p>

                    <p className="text-gray-500 text-xs mt-1">
                      {cancion.album}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PLAYLISTS */}
        {tab === "playlists" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Mis Playlists</h2>

              <button
                onClick={() => router.push("/playlist/create")}
                className="bg-green-500 text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
              >
                + Crear Playlist
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="text-gray-400">
                No tienes playlists creadas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-[#181818] hover:bg-[#282828] transition p-4 rounded-xl cursor-pointer"
                  >
                    {playlist.imagen_url ? (
                      <img
                        src={playlist.imagen_url}
                        alt={playlist.nombre}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-[#2a2a2a] rounded-lg flex items-center justify-center text-5xl">
                        🎶
                      </div>
                    )}

                    <div className="mt-4">
                      <h3 className="font-bold">{playlist.nombre}</h3>

                      <p className="text-gray-400 text-sm mt-1">
                        {playlist.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PLAYER */}
      {cancionActual && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-800 p-4 flex items-center gap-4 z-50">
          {cancionActual.imagen_url ? (
            <img
              src={cancionActual.imagen_url}
              alt={cancionActual.titulo}
              className="w-14 h-14 rounded object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-[#2a2a2a] rounded flex items-center justify-center">
              🎵
            </div>
          )}

          <div className="flex-1">
            <p className="font-semibold">
              {cancionActual.titulo}
            </p>

            <p className="text-gray-400 text-sm">
              {cancionActual.artista}
            </p>
          </div>

          <button
            onClick={togglePlay}
            className="bg-green-500 text-black w-14 h-14 rounded-full text-xl font-bold hover:scale-105 transition"
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