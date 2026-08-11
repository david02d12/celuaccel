import React, { useState } from 'react';

const pill = (bg, color) => ({
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 12px', borderRadius: '99px',
  fontSize: '0.72rem', fontWeight: 700,
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
  backgroundColor: bg, color,
});

export const ProductoCard = ({ p, nombreCat, setModalVisible }) => {
  const [prodHover, setProdHover] = useState(false);

  return (
    <div className="col-6 col-md-4 col-lg-3">
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: prodHover
            ? '0 16px 40px rgba(180,0,0,0.14)'
            : '0 2px 10px rgba(0,0,0,0.06)',
          transform: prodHover ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', height: '100%',
          position: 'relative',
        }}
        onMouseEnter={() => setProdHover(true)}
        onMouseLeave={() => setProdHover(false)}
        onClick={() => setModalVisible(true)}
      >
        <div style={{ position: 'relative', height: '180px', flexShrink: 0 }}>
          {p.Imagen ? (
            <img
              src={p.Imagen} alt={p.Nombre}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div style={{
            display: p.Imagen ? 'none' : 'flex',
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg,#f5f5f5,#ebebeb)',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '6px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
              <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
            </svg>
            <span style={{ fontSize: '0.7rem', color: '#ccc', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sin imagen</span>
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(180,0,0,0.78)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '8px',
            opacity: prodHover ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.04em' }}>
              Ver detalles
            </span>
          </div>
        </div>

        <div style={{ padding: '14px 16px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={pill('rgba(192,0,0,0.09)', '#9a0000')}>
            {nombreCat(p.ID_Categoria)}
          </span>
          <h6 style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem', color: '#1a1a1a', lineHeight: 1.3 }}>
            {p.Nombre}
          </h6>
          <p style={{
            color: '#888', fontSize: '0.8rem', margin: 0, flexGrow: 1,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {p.Descripcion}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#c00000' }}>
              ${Number(p.Precio).toLocaleString()}
            </span>
            <span style={pill(
              p.Cantidad > 0 ? 'rgba(25,135,84,0.09)' : 'rgba(108,117,125,0.09)',
              p.Cantidad > 0 ? '#146c43' : '#6c757d'
            )}>
              {p.Cantidad > 0 ? `Stock ${p.Cantidad}` : 'Sin stock'}
            </span>
          </div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={e => { e.stopPropagation(); setModalVisible(true); }}
            style={{
              width: '100%', padding: '9px',
              background: 'linear-gradient(135deg,#1a1a1a,#2e2e2e)',
              color: '#fff', border: 'none', borderRadius: '9px',
              fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer',
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
};
