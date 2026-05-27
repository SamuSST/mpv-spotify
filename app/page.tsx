"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto relative overflow-hidden">

      {/* Fondo degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a2a] via-black to-black pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />

      {/* CONTENIDO */}
      <div className="relative flex-1 flex flex-col px-8 pt-20 pb-12">

        {/* Logo */}
        <div className="flex flex-col items-center mb-16">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.759-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.622.622 0 01.207.857zm1.223-2.722a.779.779 0 01-1.072.257C14.15 12.112 10.53 11.7 7.1 12.709a.779.779 0 01-.453-1.489c3.861-1.124 8.161-.588 11.235 1.41a.779.779 0 01.256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.935.935 0 11-.543-1.79c3.532-1.073 9.404-.866 13.115 1.337a.935.935 0 01-.955 1.61z"/>
          </svg>
          <h1 className="text-white text-4xl font-bold mt-4 tracking-tight">Spotify</h1>
        </div>

        {/* Texto principal */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Millones de canciones.<br />
            <span className="text-[#1DB954]">Gratis.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Escucha tu música favorita, crea playlists y descubre artistas nuevos en cualquier momento.
          </p>

          {/* Decoración — álbumes ficticios */}
          <div className="flex gap-3 mt-10 mb-2">
            {[
              "bg-gradient-to-br from-orange-500 to-red-600",
              "bg-gradient-to-br from-blue-500 to-purple-600",
              "bg-gradient-to-br from-[#1DB954] to-teal-600",
              "bg-gradient-to-br from-pink-500 to-rose-600",
              "bg-gradient-to-br from-yellow-500 to-orange-500",
            ].map((color, i) => (
              <div
                key={i}
                className={`${color} rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center`}
                style={{
                  width: i === 2 ? 56 : 44,
                  height: i === 2 ? 56 : 44,
                  marginTop: i === 2 ? -6 : 0,
                  opacity: i === 0 || i === 4 ? 0.5 : i === 1 || i === 3 ? 0.75 : 1,
                }}
              >
                <svg width="20" height="20" fill="rgba(255,255,255,0.4)" viewBox="0 0 24 24">
                  <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex flex-col gap-3 mt-10">
          <button
            onClick={() => router.push("/register")}
            className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full text-sm hover:bg-[#1ed760] active:scale-[0.98] transition"
          >
            Regístrate gratis
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full bg-transparent border border-white/30 text-white font-bold py-4 rounded-full text-sm hover:border-white hover:bg-white/5 active:scale-[0.98] transition"
          >
            Iniciar sesión
          </button>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs text-center mt-8">
          Al continuar, aceptas los{" "}
          <span className="underline">Términos de uso</span> de Spotify.
        </p>
      </div>
    </div>
  );
}