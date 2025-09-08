"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Mail,
  Lock,
  UserPlus,
  Loader2,
} from "lucide-react";
import api from "../lib/api";
import {
  getToken,
  getUser,
  homeByRole,
  onAuthChange,
  setAuth,
  setUser,
} from "../lib/auth";

export default function EnhancedAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const redirected = useRef(false); // evita doble redirect en Strict Mode

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Register form state (si vas a usar /auth/register)
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    role: "cliente", // <-- importante: coincide con backend
    display_name: "",
  });

  // Redirección automática si hay sesión o cuando se establezca
  useEffect(() => {
    const go = (u: any) => {
      if (redirected.current) return;
      const user = u ?? getUser();
      if (getToken() && user) {
        const from = (loc.state as any)?.from as string | undefined;
        redirected.current = true;
        nav(from || homeByRole(user.role), { replace: true });
      }
    };
    // si ya hay sesión
    go(null);
    // escucha cambios (setAuth/clearAuth disparan el evento)
    const off = onAuthChange(go);
    return off;
  }, [nav, loc.state]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await api.post("/auth/login", loginData);

      if (r.status === 403 && r.data?.code === "SUSPENDED") {
        setError(r.data?.error || "Tu cuenta está suspendida temporalmente.");
        setLoading(false);
        return;
      }

      const ok = !!r.data?.ok;
      const access_token = r.data?.access_token as string | undefined;
      let user = r.data?.user as any | undefined;
      if (!ok || !access_token) throw new Error("Credenciales inválidas");

      // Guarda token primero (para que /auth/me lleve Bearer via interceptor)
      setAuth(access_token);

      // Si el login no devolvió user/role, completamos con /auth/me
      if (!user || !user.role) {
        const me = await api.get("/auth/me");
        user = me.data?.user;
      }

      const normalizedUser = {
        id: String(user?.id || user?.user?.id || ""),
        email: String(user?.email || ""),
        name: user?.name ?? user?.display_name ?? "",
        role: (user?.role ?? "").toString(),
      };
      setUser(normalizedUser);
      nav("/auth/redirect", { replace: true });

      // No navegamos aquí: el useEffect superior hará el redirect de forma segura
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err?.message || "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Ejemplo real (si tienes endpoint):
      await api.post("/auth/register", registerData);
      setIsLogin(true);

      // Demo:
      setTimeout(() => {
        setIsLogin(true);
        setError("");
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((v) => !v);
    setError("");
    setShowPassword(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center min-h-screen px-4 sm:px-6">
        {/* Left side - Branding */}
        <motion.div
          className="hidden lg:flex flex-col justify-center space-y-8 px-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Unimas</h1>
            </div>
            <p className="text-xl text-slate-600 font-light">
              Agenda tus servicios de forma sencilla y eficiente
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
              <span>Disponibilidad en tiempo real</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
              <span>Re-agendar y cancelar fácilmente</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
              <span>Interfaz rápida e intuitiva</span>
            </div>
          </div>
        </motion.div>

        {/* Right side - Auth forms */}
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {isLogin ? "Bienvenido de vuelta" : "Crear cuenta nueva"}
                </h2>
                <p className="text-slate-600">
                  {isLogin
                    ? "Ingresa tus credenciales para continuar"
                    : "Completa los datos para registrarte"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="login-email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          id="login-email"
                          type="email"
                          placeholder="tu@correo.com"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="login-password"
                        className="text-sm font-medium text-slate-700"
                      >
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <p className="text-sm text-red-600">{error}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Ingresando...
                        </>
                      ) : (
                        <>
                          Ingresar
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="register-name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Nombre completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          id="register-name"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={registerData.display_name}
                          onChange={(e) =>
                            setRegisterData((prev) => ({
                              ...prev,
                              display_name: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="register-email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          id="register-email"
                          type="email"
                          placeholder="tu@correo.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="register-password"
                        className="text-sm font-medium text-slate-700"
                      >
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <p className="text-sm text-red-600">{error}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Crear cuenta
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="text-center">
                <button
                  onClick={toggleAuthMode}
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                >
                  {isLogin ? (
                    <>
                      ¿No tienes cuenta?{" "}
                      <span className="font-medium">Regístrate</span>
                    </>
                  ) : (
                    <>
                      ¿Ya tienes cuenta?{" "}
                      <span className="font-medium">Inicia sesión</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
