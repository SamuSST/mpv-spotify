"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  plan: string;
}

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

export default function AdminPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [tabActiva, setTabActiva] = useState<"usuarios" | "canciones" | "playlists">("usuarios");

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else if (data.user.email !== "samito0630@outlook.com") {
        router.push("/mvp");
      } else {
        fetchUsuarios();
        fetchCanciones();
        fetchPlaylists();
      }
    };
    verificarAdmin();
  }, [router]);

  const fetchUsuarios = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nombre", { ascending: true });
    if (!error) setUsuarios(data || []);
  };

  const fetchCanciones = async () => {
    const { data, error } = await supabase
      .from("canciones")
      .select("*")
      .order("titulo", { ascending: true });
    if (!error) setCanciones(data || []);
    setLoading(false);
  };

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("nombre", { ascending: true });
    if (!error) setPlaylists(data || []);
  };

  const eliminarCancion = async (id: string) => {
    if (!confirm("¿Eliminar esta canción?")) return;
    const { error } = await supabase.from("canciones").delete().eq("id", id);
    if (error) setMensaje("❌ Error al eliminar canción");
    else { setMensaje("✅ Canción eliminada"); fetchCanciones(); }
  };

  const eliminarPlaylist = async (id: string) => {
    if (!confirm("¿Eliminar esta playlist?")) return;
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) setMensaje("❌ Error al eliminar playlist");
    else { setMensaje("✅ Playlist eliminada"); fetchPlaylists(); }
  };

  const actualizarUsuario = async (id: string, nombre: string, telefono: string, plan: string) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ nombre, telefono, plan })
      .eq("id", id);
    if (error) setMensaje("❌ Error al actualizar usuario");
    else { setMensaje("✅ Usuario actualizado"); fetchUsuarios(); }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-green-500">Panel Admin</h1>
            <p className="text-gray-400 text-sm mt-1 hidden sm:block">Administración Spotify Clone</p>
          </div>
          <button
            onClick={() => router.push("/mvp")}
            className="bg-green-500 text-black px-4 py-2 rounded-full font-semibold text-sm hover:scale-105 transition whitespace-nowrap"
          >
            ← Volver al MVP
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* MENSAJE */}
        {mensaje && (
          <div className="bg-[#181818] border border-green-500 text-center py-3 rounded-lg mb-6 text-sm">
            {mensaje}
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-[#181818] p-1 rounded-xl">
          {(["usuarios", "canciones", "playlists"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm capitalize transition ${
                tabActiva === tab
                  ? "bg-green-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "usuarios" ? `👥 ${tab}` : tab === "canciones" ? `🎵 ${tab}` : `📂 ${tab}`}
            </button>
          ))}
        </div>

        {/* 👥 USUARIOS */}
        {tabActiva === "usuarios" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Usuarios ({usuarios.length})</h2>

            {/* Vista móvil — cards */}
            <div className="flex flex-col gap-4 md:hidden">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="bg-[#181818] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs text-gray-500">{usuario.correo}</p>
                  <input
                    type="text"
                    defaultValue={usuario.nombre}
                    onChange={(e) => (usuario.nombre = e.target.value)}
                    placeholder="Nombre"
                    className="bg-[#2a2a2a] p-2 rounded text-sm w-full"
                  />
                  <input
                    type="text"
                    defaultValue={usuario.telefono || ""}
                    onChange={(e) => (usuario.telefono = e.target.value)}
                    placeholder="Teléfono"
                    className="bg-[#2a2a2a] p-2 rounded text-sm w-full"
                  />
                  <select
                    defaultValue={usuario.plan || "Free"}
                    onChange={(e) => (usuario.plan = e.target.value)}
                    className="bg-[#2a2a2a] p-2 rounded text-sm w-full"
                  >
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                  </select>
                  <button
                    onClick={() => actualizarUsuario(usuario.id, usuario.nombre, usuario.telefono, usuario.plan)}
                    className="bg-green-500 text-black py-2 rounded-lg font-semibold text-sm"
                  >
                    Guardar
                  </button>
                </div>
              ))}
            </div>

            {/* Vista desktop — tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full bg-[#121212] rounded-xl overflow-hidden">
                <thead className="bg-[#1f1f1f]">
                  <tr>
                    <th className="p-4 text-left text-sm">Nombre</th>
                    <th className="p-4 text-left text-sm">Correo</th>
                    <th className="p-4 text-left text-sm">Teléfono</th>
                    <th className="p-4 text-left text-sm">Plan</th>
                    <th className="p-4 text-left text-sm">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-t border-gray-800">
                      <td className="p-4">
                        <input
                          type="text"
                          defaultValue={usuario.nombre}
                          onChange={(e) => (usuario.nombre = e.target.value)}
                          className="bg-[#2a2a2a] p-2 rounded w-full text-sm"
                        />
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{usuario.correo}</td>
                      <td className="p-4">
                        <input
                          type="text"
                          defaultValue={usuario.telefono || ""}
                          onChange={(e) => (usuario.telefono = e.target.value)}
                          className="bg-[#2a2a2a] p-2 rounded w-full text-sm"
                        />
                      </td>
                      <td className="p-4">
                        <select
                          defaultValue={usuario.plan || "Free"}
                          onChange={(e) => (usuario.plan = e.target.value)}
                          className="bg-[#2a2a2a] p-2 rounded text-sm"
                        >
                          <option value="Free">Free</option>
                          <option value="Premium">Premium</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => actualizarUsuario(usuario.id, usuario.nombre, usuario.telefono, usuario.plan)}
                          className="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold text-sm"
                        >
                          Guardar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 🎵 CANCIONES */}
        {tabActiva === "canciones" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Canciones ({canciones.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {canciones.map((cancion) => (
                <div key={cancion.id} className="bg-[#181818] p-3 rounded-xl">
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
                  <div className="mt-3">
                    <h3 className="font-bold text-sm truncate">{cancion.titulo}</h3>
                    <p className="text-gray-400 text-xs truncate">{cancion.artista}</p>
                    <p className="text-gray-500 text-xs truncate">{cancion.album}</p>
                  </div>
                  <button
                    onClick={() => eliminarCancion(cancion.id)}
                    className="mt-3 bg-red-500 hover:bg-red-600 transition w-full py-1.5 rounded-lg font-semibold text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 📂 PLAYLISTS */}
        {tabActiva === "playlists" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Playlists ({playlists.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="bg-[#181818] p-3 rounded-xl">
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
                  <button
                    onClick={() => eliminarPlaylist(playlist.id)}
                    className="mt-3 bg-red-500 hover:bg-red-600 transition w-full py-1.5 rounded-lg font-semibold text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}