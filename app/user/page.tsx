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
  avatar_url: string;
}

export default function UserPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatar, setAvatar] = useState("");

  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  // 🔒 Verificar sesión
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 🔎 Buscar usuario
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      // ❌ Si no existe en tabla usuarios
      if (error || !data) {
        const nuevoUsuario = {
          id: user.id,
          nombre: user.user_metadata?.nombre || "",
          correo: user.email || "",
          telefono: "",
          avatar_url: "",
          plan: "Free",
        };

        // Crear usuario automáticamente
        await supabase
          .from("usuarios")
          .insert([nuevoUsuario]);

        setUsuario(nuevoUsuario);

        setNombre(nuevoUsuario.nombre);
        setTelefono("");
        setAvatar("");
      } else {
        setUsuario(data);

        setNombre(data.nombre || "");
        setTelefono(data.telefono || "");
        setAvatar(data.avatar_url || "");
      }

      setLoading(false);
    };

    getUser();
  }, [router]);

  // 💾 Actualizar perfil
  const actualizarPerfil = async () => {
    if (!usuario) return;

    const { error } = await supabase
      .from("usuarios")
      .update({
        nombre,
        telefono,
        avatar_url: avatar,
      })
      .eq("id", usuario.id);

    if (error) {
      setMensaje("❌ Error al actualizar perfil");
    } else {
      setMensaje("✅ Perfil actualizado");

      // actualizar datos locales
      setUsuario({
        ...usuario,
        nombre,
        telefono,
        avatar_url: avatar,
      });
    }
  };

  // 🚪 Logout
  const cerrarSesion = async () => {
    await supabase.auth.signOut();

    router.push("/login");
  };

  // ⏳ Loading
  if (loading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-white mt-4 text-lg">
          Cargando perfil...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-500">
              Mi Perfil
            </h1>

            <p className="text-gray-400 mt-2">
              Configura tu cuenta Spotify
            </p>
          </div>

          <button
            onClick={() => router.push("/mvp")}
            className="bg-green-500 hover:bg-green-400 transition text-black px-5 py-2 rounded-full font-bold"
          >
            Volver
          </button>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div className="bg-[#181818] border border-green-500 p-4 rounded-xl mb-6 text-center">
            {mensaje}
          </div>
        )}

        {/* CARD */}
        <div className="bg-[#121212] border border-gray-800 rounded-3xl p-8 shadow-2xl">
          {/* PERFIL */}
          <div className="flex flex-col items-center">
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-36 h-36 rounded-full object-cover border-4 border-green-500 shadow-lg"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-[#2a2a2a] flex items-center justify-center text-6xl">
                👤
              </div>
            )}

            <h2 className="text-3xl font-bold mt-5">
              {nombre || "Usuario"}
            </h2>

            <p className="text-gray-400 mt-2">
              {usuario?.correo}
            </p>

            <span className="mt-4 bg-green-500 text-black px-5 py-2 rounded-full text-sm font-bold">
              Spotify {usuario?.plan || "Free"}
            </span>
          </div>

          {/* FORMULARIO */}
          <div className="mt-10 space-y-6">
            {/* Nombre */}
            <div>
              <label className="block mb-2 text-gray-300 font-semibold">
                Nombre
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                className="w-full bg-[#181818] border border-gray-700 rounded-xl p-4 outline-none focus:border-green-500 transition"
                placeholder="Tu nombre"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block mb-2 text-gray-300 font-semibold">
                Teléfono
              </label>

              <input
                type="text"
                value={telefono}
                onChange={(e) =>
                  setTelefono(e.target.value)
                }
                className="w-full bg-[#181818] border border-gray-700 rounded-xl p-4 outline-none focus:border-green-500 transition"
                placeholder="Tu teléfono"
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block mb-2 text-gray-300 font-semibold">
                URL del Avatar
              </label>

              <input
                type="text"
                value={avatar}
                onChange={(e) =>
                  setAvatar(e.target.value)
                }
                className="w-full bg-[#181818] border border-gray-700 rounded-xl p-4 outline-none focus:border-green-500 transition"
                placeholder="https://..."
              />
            </div>

            {/* BOTONES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <button
                onClick={actualizarPerfil}
                className="bg-green-500 hover:bg-green-400 transition text-black font-bold py-4 rounded-xl"
              >
                Guardar Cambios
              </button>

              <button
                onClick={cerrarSesion}
                className="bg-red-500 hover:bg-red-400 transition text-white font-bold py-4 rounded-xl"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* EXTRA */}
        <div className="mt-8 bg-[#121212] border border-gray-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Tu Plan
          </h2>

          <div className="bg-[#181818] rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">
                Spotify {usuario?.plan || "Free"}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Acceso a tus playlists y canciones favoritas
              </p>
            </div>

            <button className="bg-green-500 hover:bg-green-400 transition text-black px-5 py-2 rounded-full font-bold">
              Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}