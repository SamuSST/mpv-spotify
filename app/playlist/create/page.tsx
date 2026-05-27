"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreatePlaylistPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCrear = async () => {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("playlists").insert({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      imagen_url: imagenUrl.trim(),
      usuario_id: user.id,
    });

    if (error) {
      setError("❌ Error al crear la playlist: " + error.message);
      setLoading(false);
    } else {
      router.push("/mvp");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
        >
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold">Nueva playlist</h1>
      </div>

      <div className="flex-1 px-5 flex flex-col gap-6">
        {/* Imagen preview */}
        <div className="flex justify-center">
          <div className="w-44 h-44 rounded-2xl overflow-hidden bg-[#282828] flex items-center justify-center shadow-2xl">
            {imagenUrl ? (
              <img src={imagenUrl} alt="portada" className="w-full h-full object-cover" />
            ) : (
              <svg width="56" height="56" fill="rgba(255,255,255,0.2)" viewBox="0 0 24 24">
                <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/>
              </svg>
            )}
          </div>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
              Nombre *
            </label>
            <input
              type="text"
              placeholder="Mi playlist"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-[#282828] text-white placeholder-white/30 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1DB954] transition"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
              Descripción
            </label>
            <textarea
              placeholder="Agrega una descripción opcional..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full bg-[#282828] text-white placeholder-white/30 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1DB954] transition resize-none"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
              URL de portada
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              className="w-full bg-[#282828] text-white placeholder-white/30 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1DB954] transition"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl">
            {error}
          </p>
        )}

        {/* Botón crear */}
        <button
          onClick={handleCrear}
          disabled={loading}
          className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full text-sm hover:bg-[#1ed760] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Creando...
            </span>
          ) : (
            "Crear playlist"
          )}
        </button>

        <p className="text-white/30 text-xs text-center pb-8">
          La playlist se guardará en tu biblioteca
        </p>
      </div>
    </div>
  );
}