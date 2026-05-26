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

  // 🔒 Verificar admin
  useEffect(() => {
    const verificarAdmin = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else if (
        data.user.email !== "samito0630@outlook.com"
      ) {
        router.push("/mvp");
      } else {
        fetchUsuarios();
        fetchCanciones();
        fetchPlaylists();
      }
    };

    verificarAdmin();
  }, [router]);

  // 👥 Usuarios
  const fetchUsuarios = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error.message);
    } else {
      setUsuarios(data || []);
    }
  };

  // 🎵 Canciones
  const fetchCanciones = async () => {
    const { data, error } = await supabase
      .from("canciones")
      .select("*")
      .order("titulo", { ascending: true });

    if (error) {
      console.error(error.message);
    } else {
      setCanciones(data || []);
    }

    setLoading(false);
  };

  // 📂 Playlists
  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error.message);
    } else {
      setPlaylists(data || []);
    }
  };

  // 🗑 Eliminar canción
  const eliminarCancion = async (id: string) => {
    const confirmar = confirm(
      "¿Eliminar esta canción?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("canciones")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("❌ Error al eliminar canción");
    } else {
      setMensaje("✅ Canción eliminada");
      fetchCanciones();
    }
  };

  // 🗑 Eliminar playlist
  const eliminarPlaylist = async (id: string) => {
    const confirmar = confirm(
      "¿Eliminar esta playlist?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("❌ Error al eliminar playlist");
    } else {
      setMensaje("✅ Playlist eliminada");
      fetchPlaylists();
    }
  };

  // 💾 Actualizar usuario
  const actualizarUsuario = async (
    id: string,
    nombre: string,
    telefono: string,
    plan: string
  ) => {
    const { error } = await supabase
      .from("usuarios")
      .update({
        nombre,
        telefono,
        plan,
      })
      .eq("id", id);

    if (error) {
      setMensaje("❌ Error al actualizar usuario");
    } else {
      setMensaje("✅ Usuario actualizado");
      fetchUsuarios();
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-green-500">
            Panel Admin
          </h1>

          <p className="text-gray-400 mt-2">
            Administración Spotify Clone
          </p>
        </div>

        <button
          onClick={() => router.push("/mvp")}
          className="bg-green-500 text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
        >
          Volver al MVP
        </button>
      </div>

      {mensaje && (
        <div className="bg-[#181818] border border-green-500 text-center py-3 rounded-lg mb-6">
          {mensaje}
        </div>
      )}

      {/* 👥 USUARIOS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Usuarios
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full bg-[#121212] rounded-xl overflow-hidden">
            <thead className="bg-[#1f1f1f]">
              <tr>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Correo</th>
                <th className="p-4 text-left">Teléfono</th>
                <th className="p-4 text-left">Plan</th>
                <th className="p-4 text-left">Acción</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-t border-gray-800"
                >
                  <td className="p-4">
                    <input
                      type="text"
                      value={usuario.nombre}
                      onChange={(e) =>
                        (usuario.nombre = e.target.value)
                      }
                      className="bg-[#2a2a2a] p-2 rounded w-full"
                    />
                  </td>

                  <td className="p-4 text-gray-400">
                    {usuario.correo}
                  </td>

                  <td className="p-4">
                    <input
                      type="text"
                      value={usuario.telefono || ""}
                      onChange={(e) =>
                        (usuario.telefono = e.target.value)
                      }
                      className="bg-[#2a2a2a] p-2 rounded w-full"
                    />
                  </td>

                  <td className="p-4">
                    <select
                      value={usuario.plan || "Free"}
                      onChange={(e) =>
                        (usuario.plan = e.target.value)
                      }
                      className="bg-[#2a2a2a] p-2 rounded"
                    >
                      <option value="Free">Free</option>
                      <option value="Premium">
                        Premium
                      </option>
                    </select>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        actualizarUsuario(
                          usuario.id,
                          usuario.nombre,
                          usuario.telefono,
                          usuario.plan
                        )
                      }
                      className="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold"
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

      {/* 🎵 CANCIONES */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Canciones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canciones.map((cancion) => (
            <div
              key={cancion.id}
              className="bg-[#181818] p-4 rounded-xl"
            >
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

              <div className="mt-4">
                <h3 className="font-bold">
                  {cancion.titulo}
                </h3>

                <p className="text-gray-400">
                  {cancion.artista}
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  {cancion.album}
                </p>
              </div>

              <button
                onClick={() =>
                  eliminarCancion(cancion.id)
                }
                className="mt-4 bg-red-500 hover:bg-red-600 transition w-full py-2 rounded-lg font-semibold"
              >
                Eliminar canción
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 📂 PLAYLISTS */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Playlists
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-[#181818] p-4 rounded-xl"
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
                <h3 className="font-bold">
                  {playlist.nombre}
                </h3>

                <p className="text-gray-400 text-sm mt-2">
                  {playlist.descripcion}
                </p>
              </div>

              <button
                onClick={() =>
                  eliminarPlaylist(playlist.id)
                }
                className="mt-4 bg-red-500 hover:bg-red-600 transition w-full py-2 rounded-lg font-semibold"
              >
                Eliminar playlist
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}