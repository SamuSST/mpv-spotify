"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage("❌ Error en registro: " + authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setMessage("⚠️ No se pudo obtener el ID del usuario.");
      return;
    }

    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([{ id: userId, nombre, correo: email, telefono, plan: "free" }]);

    if (insertError) {
      setMessage("⚠️ Error al guardar en tabla: " + insertError.message);
      return;
    }

    setMessage("✅ Registro exitoso. Revisa tu correo para confirmar.");
  };

  if (loading) return <p className="text-center mt-10">Verificando sesión...</p>;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-[#121212] p-8 rounded-lg w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <span className="text-green-500 text-5xl">🎵</span>
        </div>
        <h1 className="text-white text-2xl font-bold text-center mb-6">
          Regístrate en Spotify
        </h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="bg-[#2a2a2a] text-white border border-gray-600 p-3 rounded placeholder-gray-400"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#2a2a2a] text-white border border-gray-600 p-3 rounded placeholder-gray-400"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="bg-[#2a2a2a] text-white border border-gray-600 p-3 rounded placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#2a2a2a] text-white border border-gray-600 p-3 rounded placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-green-500 text-black font-bold p-3 rounded hover:bg-green-400"
          >
            Registrarse
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-300">{message}</p>}
        <p className="mt-4 text-center text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-green-500 underline"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}