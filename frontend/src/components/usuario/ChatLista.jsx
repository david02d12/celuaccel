import React from 'react';

const ChatLista = ({
  role,
  servicios,
  chatsFiltrados,
  chatSel,
  setChatSel,
  busquedaChat,
  setBusquedaChat,
  cargandoChats,
  panelAbierto,
  iniciandoChat,
  iniciarChatDesdeServicio,
  setVista
}) => {
  return (
    <div
      className={`d-flex flex-column border-end ${panelAbierto ? 'd-flex' : 'd-none d-md-flex'}`}
      style={{ 
        width: '300px', 
        minWidth: '260px', 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)',
        flexShrink: 0 
      }}
    >
      <div className="p-3 border-bottom" style={{ borderColor: 'var(--color-border)' }}>
        <p className="fw-bold mb-2 small text-muted">
          {role === 2 ? 'Mis Conversaciones' : 'Conversaciones Abiertas'}
        </p>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Buscar chat (ID o Servicio)..."
          value={busquedaChat}
          onChange={e => setBusquedaChat(e.target.value)}
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
        />
      </div>
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        {cargandoChats ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" style={{ color: 'var(--color-primary)' }} />
            <p className="text-muted small mt-2">Cargando conversaciones...</p>
          </div>
        ) : chatsFiltrados.length === 0 ? (
          <div className="text-center p-3">
            {role === 2 && servicios.length > 0 ? (
              <>
                <p className="text-muted small mb-3">Selecciona un servicio para iniciar un chat con el asesor:</p>
                {servicios.map(s => (
                  <div key={s.ID_Servicio}
                    className="border rounded-3 p-2 mb-2 text-start"
                    style={{ backgroundColor: 'var(--color-surfaceAlt)', borderColor: 'var(--color-border)', fontSize: '0.82rem' }}
                  >
                    <div className="fw-bold mb-1">Servicio #{s.ID_Servicio}</div>
                    <div className="text-muted mb-2">{s.Movil_Nombre || 'Sin dispositivo'}</div>
                    <button
                      className="btn btn-sm btn-primary w-100"
                      disabled={iniciandoChat === s.ID_Servicio}
                      onClick={() => iniciarChatDesdeServicio(s.ID_Servicio)}
                    >
                      {iniciandoChat === s.ID_Servicio ? 'Iniciando...' : 'Iniciar Chat'}
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className="text-muted small mb-2">No tienes conversaciones activas.</p>
                {role === 2 && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setVista('miServicio')}
                  >
                    Ver Mis Servicios
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          chatsFiltrados.map(c => {
            const isActive = chatSel?.Codigo_Chat === c.Codigo_Chat;
            
            const nombreCliente = c.Nombre_Usuario || c.ID_Usuario;
            const nombreTecnico = c.Nombre_Tecnico || 'Soporte Técnico';
            let titulo = '';
            let iniciales = 'CH';

            if (role === 2) {
              titulo = nombreTecnico;
              iniciales = nombreTecnico.substring(0, 2).toUpperCase();
            } else if (role === 1) {
              titulo = nombreCliente;
              iniciales = nombreCliente.substring(0, 2).toUpperCase();
            } else {
              titulo = `${nombreCliente} - ${nombreTecnico}`;
              iniciales = nombreCliente.substring(0, 1).toUpperCase() + nombreTecnico.substring(0, 1).toUpperCase();
            }

            return (
              <div
                key={c.Codigo_Chat}
                className="p-3 border-bottom"
                role="button" tabIndex="0"
                style={{
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--color-primary-lt)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  transition: 'background-color .15s, color .15s',
                  borderColor: 'var(--color-border)'
                }}
                onClick={() => setChatSel(c)}
                onKeyDown={(e) => { if (e.key === 'Enter') setChatSel(c); }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      minWidth: '40px', 
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-dark-soft)', 
                      fontSize: '0.8rem',
                      color: '#fff'
                    }}>
                    {iniciales}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div className={`fw-bold small text-truncate ${isActive ? 'text-primary' : ''}`} title={titulo}>{titulo}</div>
                    <div className="small text-muted text-truncate">
                      Chat #{c.Codigo_Chat} • {c.ID_Servicio ? `Servicio #${c.ID_Servicio}` : 'Catálogo'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatLista;
