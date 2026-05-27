"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
      } else {
        router.push("/user");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("❌ Error al iniciar sesión: " + error.message);
      return;
    }
    if (data.user) router.push("/mvp");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-[#121212] p-6 sm:p-8 rounded-2xl w-full max-w-sm shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <span className="text-green-500 text-5xl">🎵</span>
        </div>

        <h1 className="text-white text-2xl font-bold text-center mb-6">
          Inicia sesión en Spotify
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#2a2a2a] text-white border border-gray-700 focus:border-green-500 focus:outline-none p-3 rounded-lg placeholder-gray-500 transition text-sm"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#2a2a2a] text-white border border-gray-700 focus:border-green-500 focus:outline-none p-3 rounded-lg placeholder-gray-500 transition text-sm"
          />
          <button
            type="submit"
            className="bg-green-500 text-black font-bold p-3 rounded-full hover:bg-green-400 active:scale-95 transition text-sm"
          >
            Iniciar sesión
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-300 text-sm">{message}</p>
        )}

        <p className="mt-6 text-center text-gray-400 text-sm">
          ¿No tienes cuenta?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-green-500 hover:underline font-semibold"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}