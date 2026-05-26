"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl font-bold text-black">
          ♪
        </div>

        <h1 className="text-5xl font-bold text-green-500">
          Spotify
        </h1>
      </div>

      {/* TEXTO */}
      <div className="text-center max-w-xl">
        <h2 className="text-4xl font-bold mb-4">
          Música para todos
        </h2>

        <p className="text-gray-400 text-lg leading-8">
          Escucha millones de canciones, crea playlists
          y disfruta de tu música favorita en cualquier momento.
        </p>
      </div>

      {/* BOTONES */}
      <div className="flex flex-col md:flex-row gap-4 mt-10 w-full max-w-md">
        <button
          onClick={() => router.push("/login")}
          className="flex-1 bg-green-500 hover:bg-green-400 transition text-black font-bold py-4 rounded-full"
        >
          Iniciar Sesión
        </button>

        <button
          onClick={() => router.push("/register")}
          className="flex-1 border border-green-500 hover:bg-green-500 hover:text-black transition font-bold py-4 rounded-full"
        >
          Registrarse
        </button>
      </div>

      {/* FOOTER */}
      <p className="mt-16 text-gray-500 text-sm text-center">
        Spotify Clone · Next.js + Supabase
      </p>
    </div>
  );
}