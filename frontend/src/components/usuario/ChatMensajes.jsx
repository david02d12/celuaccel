import React from 'react';

const ChatMensajes = ({
  chatSel,
  chats,
  role,
  cargando,
  mensajes,
  usuario,
  nombre,
  nuevoMensaje,
  setNuevoMensaje,
  enviarMensaje,
  handleKeyDown,
  eliminarMensaje,
  mensajesEndRef
}) => {
  return (
    <div className="d-flex flex-column flex-grow-1" style={{ overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
      {!chatSel ? (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted px-4">
          <div style={{ color: 'var(--color-primary)', opacity: 0.4 }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
          </div>
          <h5 className="mt-3 fw-bold text-muted">
            {chats.length === 0 && role === 2 ? 'Inicia una conversación' : 'Selecciona un chat'}
          </h5>
          <p className="small text-center text-muted">
            {chats.length === 0 && role === 2
              ? 'Elige uno de tus servicios de la lista lateral para chatear con tu asesor técnico.'
              : role === 2
                ? 'Elige una de tus conversaciones activas de la lista lateral.'
                : 'Elige una conversación de la lista lateral para ver los mensajes y responder al cliente.'}
          </p>
        </div>
      ) : (
        <>
          {/* CABECERA DEL CHAT */}
          {(() => {
            const nombreCliente = chatSel.Nombre_Usuario || chatSel.ID_Usuario;
            const nombreTecnico = chatSel.Nombre_Tecnico || 'Soporte Técnico';
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
              <div className="p-3 border-bottom d-flex align-items-center gap-3" style={{ backgroundColor: 'var(--color-surfaceAlt)', borderColor: 'var(--color-border)' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: '44px', height: '44px', backgroundColor: 'var(--color-primary)', fontSize: '0.9rem', color: '#fff' }}>
                  {iniciales}
                </div>
                <div>
                  <div className="fw-bold fs-5">{titulo}</div>
                  <div className="small text-muted">
                    Chat #{chatSel.Codigo_Chat} • {chatSel.ID_Servicio
                      ? `Servicio #${chatSel.ID_Servicio}`
                      : `Consulta de catálogo`
                    }
                  </div>
                </div>
              </div>
            );
          })()}

          {/* MENSAJES */}
          <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: 'var(--chat-bg)' }}>
            {cargando ? (
              <div className="text-center py-4 text-muted">Cargando mensajes...</div>
            ) : mensajes.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p>No hay mensajes en este chat aún.</p>
                <p className="small">Sé el primero en escribir.</p>
              </div>
            ) : (
              mensajes.map(m => {
                const esMio = String(m.ID_Usuario) === String(usuario);
                return (
                  <div key={m.Codigo_Mensaje}
                    className={`d-flex mb-3 ${esMio ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div style={{ maxWidth: '70%' }}>
                      <div
                        className="p-3 rounded-3 shadow-sm"
                        style={{
                          backgroundColor: esMio ? 'var(--chat-bubble-me)' : 'var(--chat-bubble-other)',
                          color: esMio ? '#ffffff' : 'var(--chat-text-other)',
                          borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        }}>
                        <div className="small fw-bold opacity-75 mb-1">{m.Nombre_Usuario || m.ID_Usuario}</div>
                        <div>{m.Mensaje}</div>
                      </div>
                      <div className={`d-flex mt-1 gap-2 align-items-center ${esMio ? 'justify-content-end' : ''}`}>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {m.Fecha_Mensaje
                            ? new Date(m.Fecha_Mensaje).toLocaleString('es-CO', {
                                day: '2-digit', month: 'short',
                                hour: '2-digit', minute: '2-digit'
                              })
                            : ''}
                        </small>
                        {esMio && (
                          <div className="d-flex align-items-center gap-2">
                            <svg 
                              width="16" height="16" viewBox="0 0 24 24" 
                              fill="none" 
                              stroke={Number(m.Estado) === 1 ? '#34B7F1' : '#9ca3af'} 
                              strokeWidth="2.5" 
                              strokeLinecap="round" strokeLinejoin="round"
                              title={Number(m.Estado) === 1 ? 'Leído' : 'Enviado'}
                            >
                              <polyline points="18 6 9 17 4 12"></polyline>
                              <polyline points="22 6 13 17 11.5 15.5"></polyline>
                            </svg>
                            <button 
                              className="btn btn-link p-0 text-decoration-none text-danger fw-bold" 
                              style={{ fontSize: '0.75rem' }} 
                              onClick={() => eliminarMensaje(m.Codigo_Mensaje)}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* INPUT DE MENSAJE */}
          <div className="p-3 border-top" style={{ backgroundColor: 'var(--color-surfaceAlt)', borderColor: 'var(--color-border)' }}>
            <div className="d-flex gap-2">
              <input
                id="chat-input-mensaje"
                type="text"
                className="form-control"
                placeholder="Escribe un mensaje... (Enter para enviar)"
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
              <button
                id="btn-enviar-mensaje"
                className="btn btn-primary px-4"
                onClick={enviarMensaje}
                disabled={!nuevoMensaje.trim()}>
                Enviar
              </button>
            </div>
            <small className="text-muted mt-1 d-block">
              Enviando como: <strong>{nombre}</strong> · Chat #{chatSel.Codigo_Chat}
            </small>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatMensajes;
