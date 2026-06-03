import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ResetPassword({ setVista }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setMessage("Token inválido o no proporcionado");
    }
    setToken(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("No hay token válido");
      return;
    }

    try {
      const res = await axios.post(`${API}/auth/reset-password/${token}`, {
        newPassword: password,
      });

      setMessage(res.data.message || "Contraseña actualizada correctamente");

      // 🔑 después de 2 segundos, volver al login
      setTimeout(() => {
        setVista("home"); // o "login" según tu flujo
      }, 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error al cambiar contraseña"
      );
    }
  };

  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#f4f6f8" }}
    >
      <div
        className="card p-4 bg-white"
        style={{
          width: "390px",
          borderRadius: "14px",
          border: "1px solid rgba(0,0,0,0.13)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h3 className="text-center mb-4">Nueva contraseña</h3>

        <form onSubmit={handleSubmit}>
          <label className="form-label fw-bold small text-muted mb-1">
            Nueva contraseña
          </label>
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Ingresa tu nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn w-100 text-white fw-bold py-2"
            style={{ backgroundColor: "#DB0000", borderRadius: "8px" }}
            disabled={!token}
          >
            Guardar contraseña
          </button>
        </form>

        {message && <p className="text-danger mt-3">{message}</p>}
      </div>
    </div>
  );
}
