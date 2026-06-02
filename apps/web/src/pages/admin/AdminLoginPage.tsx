import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../lib/api";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(password);
      navigate("/admin");
    } catch {
      setError("Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slip-ink text-center">
        Acceso administrador
      </h1>
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-slip-accent-blue/20 bg-slip-surface-cool/30 p-6"
      >
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slip-ink mb-1"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slip-accent-blue/40 px-4 py-2"
            required
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="text-sm text-slip-primary font-medium">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-slip-primary text-white font-bold py-3 hover:bg-slip-primary-muted disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
