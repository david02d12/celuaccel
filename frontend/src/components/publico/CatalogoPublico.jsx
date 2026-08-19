import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useCatalogoPublico } from '../../hooks/useCatalogoPublico';
import { FiltrosCatalogo } from './FiltrosCatalogo';
import { ProductoCard } from './ProductoCard';

const CatalogoPublico = ({ setVista }) => {
  const {
    productos, categorias, busqueda, setBusqueda,
    categoriaFiltro, setCategoriaFiltro, cargando, error,
    filtrados, nombreCat
  } = useCatalogoPublico();

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: "'Inter', sans-serif" }}>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'linear-gradient(135deg,#c00000 0%,#8a0000 100%)',
        boxShadow: '0 2px 20px rgba(180,0,0,0.35)',
        padding: '0',
      }}>
        <div className="container d-flex align-items-center justify-content-between" style={{ height: '60px' }}>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '3px', color: '#fff' }}>
            CELUACCEL
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setVista('catalogoPublico')}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: '6px 12px',
              }}
            >
              Catalogo
            </button>
            <button
              id="btn-ir-login"
              onClick={() => setVista('login')}
              style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                padding: '7px 20px', borderRadius: '8px', transition: 'all .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              Iniciar Sesion
            </button>
            <button
              onClick={() => setVista('registro')}
              style={{
                background: '#fff', border: 'none', color: '#c00000',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                padding: '7px 20px', borderRadius: '8px', transition: 'all .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        background: 'linear-gradient(160deg,#b80000 0%,#6b0000 60%,#3a0000 100%)',
        padding: '60px 0 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-60px', top: '-60px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', left: '-80px', bottom: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,200,200,0.75)', marginBottom: '10px',
          }}>
            Tienda en Linea
          </p>
          <h1 style={{
            fontWeight: 800, color: '#fff',
            fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
            letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.15,
          }}>
            Catalogo de Productos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', marginBottom: '36px', maxWidth: '480px' }}>
            Explora nuestra seleccion de dispositivos moviles y accesorios. Inicia sesion para hacer consultas y solicitar servicios.
          </p>

          <FiltrosCatalogo
            busqueda={busqueda} setBusqueda={setBusqueda}
            categoriaFiltro={categoriaFiltro} setCategoriaFiltro={setCategoriaFiltro}
            categorias={categorias}
          />
        </div>
      </div>

      <div className="container py-5">
        {!cargando && !error && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '28px', flexWrap: 'wrap', gap: '8px',
          }}>
            <p style={{ color: '#666', fontSize: '0.88rem', margin: 0 }}>
              <strong style={{ color: '#1a1a1a' }}>{filtrados.length}</strong> productos encontrados
              {categoriaFiltro && categorias.length > 0 && (
                <span> en <strong style={{ color: '#c00000' }}>{nombreCat(categoriaFiltro)}</strong></span>
              )}
            </p>
            <span style={{
              fontSize: '0.76rem', fontWeight: 700, color: '#c00000',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Inicia sesion para solicitar
            </span>
          </div>
        )}

        {cargando && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '3px solid #f0f0f0', borderTopColor: '#c00000',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: '#999', fontSize: '0.9rem' }}>Cargando productos...</p>
          </div>
        )}

        {error && !cargando && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#fff', borderRadius: '16px',
            border: '1px solid rgba(200,0,0,0.12)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(200,0,0,0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c00000" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h6 style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>No se pudo cargar el catalogo</h6>
            <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#c00000', color: '#fff', border: 'none',
                padding: '10px 28px', borderRadius: '8px', fontWeight: 700,
                cursor: 'pointer', fontSize: '0.88rem',
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && filtrados.length === 0 && productos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: '16px' }}>
              <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
            </svg>
            <h6 style={{ color: '#bbb', fontWeight: 600 }}>No hay productos disponibles</h6>
            <p style={{ color: '#ccc', fontSize: '0.85rem' }}>Vuelve pronto, estamos actualizando el inventario.</p>
          </div>
        )}

        {!cargando && !error && filtrados.length === 0 && productos.length > 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: '16px' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h6 style={{ color: '#aaa', fontWeight: 600 }}>Sin resultados para "{busqueda}"</h6>
            <button onClick={() => { setBusqueda(''); setCategoriaFiltro(''); }} style={{
              marginTop: '12px', background: 'none', border: '1px solid #ddd',
              padding: '8px 20px', borderRadius: '8px', color: '#888',
              cursor: 'pointer', fontSize: '0.85rem',
            }}>Limpiar filtros</button>
          </div>
        )}

        {!cargando && !error && filtrados.length > 0 && (
          <div className="row g-4">
            {filtrados.map(p => (
              <ProductoCard
                key={p.Codigo_Producto}
                p={p}
                nombreCat={nombreCat}
                setModalVisible={setModalVisible}
              />
            ))}
          </div>
        )}
      </div>

      {!cargando && !error && productos.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg,#111,#1e1e1e)',
          padding: '64px 0', textAlign: 'center', marginTop: '20px',
        }}>
          <div className="container">
            <p style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px',
            }}>
              Accede a todos los beneficios
            </p>
            <h4 style={{ fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              Crea tu cuenta y disfruta el servicio completo
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', marginBottom: '28px' }}>
              Solicita reparaciones, consulta el estado de tu equipo y chatea con el equipo tecnico.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setVista('registro')}
                style={{
                  background: '#c00000', color: '#fff', border: 'none',
                  padding: '12px 32px', borderRadius: '10px', fontWeight: 700,
                  fontSize: '0.92rem', cursor: 'pointer',
                }}
              >
                Crear cuenta gratis
              </button>
              <button
                onClick={() => setVista('login')}
                style={{
                  background: 'transparent', color: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 32px', borderRadius: '10px', fontWeight: 600,
                  fontSize: '0.92rem', cursor: 'pointer',
                }}
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVisible && (
        <div
          onClick={() => setModalVisible(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn .2s ease',
          }}
        >
          <style>{`
            @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '20px',
              padding: '40px 32px', width: '100%', maxWidth: '380px',
              textAlign: 'center',
              boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
              animation: 'slideUp .28s cubic-bezier(.4,0,.2,1)',
            }}
          >
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'rgba(192,0,0,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c00000" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h5 style={{ fontWeight: 800, color: '#111', marginBottom: '8px' }}>
              Inicia sesion para continuar
            </h5>
            <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: '28px', lineHeight: 1.6 }}>
              Para ver detalles del producto y realizar solicitudes necesitas una cuenta en CELUACCEL.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setVista('login')}
                style={{
                  background: 'linear-gradient(135deg,#c00000,#8a0000)',
                  color: '#fff', border: 'none', padding: '13px',
                  borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.92rem', boxShadow: '0 4px 14px rgba(192,0,0,0.3)',
                }}
              >
                Iniciar Sesion
              </button>
              <button
                onClick={() => setVista('registro')}
                style={{
                  background: '#f5f5f5', color: '#1a1a1a', border: 'none',
                  padding: '13px', borderRadius: '10px', fontWeight: 700,
                  cursor: 'pointer', fontSize: '0.92rem',
                }}
              >
                Crear cuenta gratis
              </button>
              <button
                onClick={() => setModalVisible(false)}
                style={{
                  background: 'none', color: '#aaa', border: 'none',
                  padding: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                }}
              >
                Seguir explorando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoPublico;
