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
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) setLoading(false);
      else router.push("/mvp");
    };
    checkUser();
  }, [router]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setMessage(authError.message);
      setSubmitting(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setMessage("No se pudo obtener el ID del usuario.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([{ id: userId, nombre, correo: email, telefono, plan: "free" }]);

    if (insertError) {
      setMessage(insertError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  // Pantalla de éxito
  if (success)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-8 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-[#1DB954]/20 flex items-center justify-center mb-6">
          <svg width="40" height="40" fill="#1DB954" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        <h2 className="text-white text-2xl font-bold mb-3">¡Cuenta creada!</h2>
        <p className="text-white/50 text-sm mb-8">
          Revisa tu correo <span className="text-white font-medium">{email}</span> para confirmar tu cuenta.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full text-sm hover:bg-[#1ed760] active:scale-[0.98] transition"
        >
          Ir a iniciar sesión
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">
      <div className="flex-1 flex flex-col px-8 pt-14 pb-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.759-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.622.622 0 01.207.857zm1.223-2.722a.779.779 0 01-1.072.257C14.15 12.112 10.53 11.7 7.1 12.709a.779.779 0 01-.453-1.489c3.861-1.124 8.161-.588 11.235 1.41a.779.779 0 01.256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.935.935 0 11-.543-1.79c3.532-1.073 9.404-.866 13.115 1.337a.935.935 0 01-.955 1.61z"/>
          </svg>
          <h1 className="text-white text-3xl font-bold mt-3 tracking-tight">Spotify</h1>
        </div>

        <h2 className="text-white text-2xl font-bold mb-1">Crea tu cuenta</h2>
        <p className="text-white/50 text-sm mb-8">Es gratis y fácil.</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full bg-[#282828] text-white placeholder-white/25 px-4 py-3.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1DB954] transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#282828] text-white placeholder-white/25 px-4 py-3.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1DB954] transition"
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Teléfono <span className="normal-case text-white/30 font-normal">(opcional)</span>
            </label>
            <input
              type="tel"
              placeholder="+57 300 000 0000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-[#282828] text-white placeholder-white/25 px-4 py-3.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1DB954] transition"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#282828] text-white placeholder-white/25 px-4 py-3.5 pr-12 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1DB954] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                )}
              </button>
            </div>
            {/* Indicador fortaleza */}
            {password && (
              <div className="flex gap-1 mt-1">
                {[1,2,3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      password.length >= i * 4
                        ? i === 1 ? "bg-red-500" : i === 2 ? "bg-yellow-500" : "bg-[#1DB954]"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {message && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <svg width="16" height="16" fill="#f87171" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p className="text-red-400 text-xs">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full text-sm hover:bg-[#1ed760] active:scale-[0.98] transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Creando cuenta...
              </span>
            ) : (
              "Crear cuenta gratis"
            )}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">o</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <p className="text-white/50 text-sm text-center">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-white font-semibold hover:text-[#1DB954] transition underline underline-offset-2"
          >
            Inicia sesión
          </button>
        </p>
      </div>

      <div className="px-8 pb-10 text-center">
        <p className="text-white/20 text-xs">
          Al registrarte, aceptas los Términos y condiciones de uso de Spotify.
        </p>
      </div>
    </div>
  );
}