import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword({ setVista }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/auth/forgot-password`, { email });
      setMessage(res.data.message || "Correo enviado para recuperar contraseña");
    } catch (error) {
      setMessage("Error al enviar el correo");
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
        <h3 className="text-center mb-4">Recuperar contraseña</h3>

        <form onSubmit={handleSubmit}>
          <label className="form-label fw-bold small text-muted mb-1">
            Correo
          </label>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn w-100 text-white fw-bold py-2"
            style={{ backgroundColor: "#DB0000", borderRadius: "8px" }}
          >
            Enviar
          </button>
        </form>

        <button
          className="btn w-100 fw-bold mt-2"
          style={{
            color: "#121212",
            borderColor: "#c0c0c0",
            backgroundColor: "transparent",
          }}
          onClick={() => setVista("home")}
        >
          Volver al login
        </button>

        {message && <p className="text-danger mt-3">{message}</p>}
      </div>
    </div>
  );
}
