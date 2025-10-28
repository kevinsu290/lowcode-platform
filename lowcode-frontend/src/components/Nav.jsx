// lowcode-frontend/src/components/Nav.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAut } from '../contexto/Aut.jsx';
import ThemeToggle from './ThemeToggle.jsx';

/* === Iconos minimal === */
const I = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M12 3 3 10h2v9h5v-6h4v6h5v-9h2L12 3z" />
    </svg>
  ),
  Blocks: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
    </svg>
  ),
  Survey: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M7 3h10a2 2 0 0 1 2 2v14l-7-3-7 3V5a2 2 0 0 1 2-2z" />
    </svg>
  ),
  Aa: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M6 18h2l1-3h6l1 3h2L13 4h-2L6 18zm4.5-5 2.5-7 2.5 7h-5z" />
    </svg>
  ),
  Chart: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M3 3h2v18H3V3zm16 10h2v8h-2v-8zM11 9h2v12h-2V9zM7 14h2v7H7v-7zm8-7h2v14h-2V7z" />
    </svg>
  ),
  Wrench: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M22 7.46 18.54 4a5 5 0 0 0-6.47 6.47L4 18.54V22h3.46l8.07-8.07A5 5 0 0 0 22 7.46z" />
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M7 10l5 5 5-5z" />
    </svg>
  ),
  /* 👇 Nuevo: icono para registrar administrador */
  UserPlus: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M15 14a5 5 0 1 0-10 0v3h10v-3zM10 12a3 3 0 1 0-0.001-6.001A3 3 0 0 0 10 12z" />
      <path fill="currentColor" d="M19 7v-2h-2V3h2V1h2v2h2v2h-2v2h-2z" />
    </svg>
  ),
};

export default function Nav(){
  const { usuario } = useAut();
  const esAdmin = usuario?.rol === 'admin' || usuario?.rol_id === 1;
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    loc.pathname === path || loc.pathname.startsWith(path + '/');

  // Badge según ruta/rol
  const badgeText = (() => {
    const p = loc.pathname;
    if (p.startsWith('/login')) return 'Login';
    if (p.startsWith('/registro')) return 'Registro';
    return esAdmin ? 'Administrador' : 'Estudiante';
  })();

  // Links PRIMARIOS (estudiante)
  const primaryStudent = [
    { to: '/', label: 'Inicio', icon: I.Home },
    { to: '/ejercicios', label: 'Ejercicios', icon: I.Blocks },
    { to: '/encuestas', label: 'Encuestas', icon: I.Survey },
  ];
  // Links PRIMARIOS (admin)
  const primaryAdmin = [
    { to: '/', label: 'Inicio', icon: I.Home },
    { to: '/admin/analitica', label: 'Analítica', icon: I.Chart },
  ];

  // Links SECUNDARIOS (dropdown Admin)
  const secondaryAdmin = [
    /* 👇 Nuevo apartado para registrar administradores */
    { to: '/admin/registrar', label: 'Registrar administrador', icon: I.UserPlus },
    { to: '/admin/encuestas', label: 'Métricas (Encuestas)', icon: I.Survey },
    { to: '/admin/ejercicios', label: 'Ejercicios (Admin)', icon: I.Wrench },
  ];

  const enAuth = loc.pathname.startsWith('/login') || loc.pathname.startsWith('/registro');

  return (
    <div className="nav">
      <div className="container nav-inner">
        {/* Brand */}
        <div className="brand">
          <span className="brand-dot"></span>
          <span>Low-Code</span>
          <span className="badge">{badgeText}</span>
        </div>

        {/* Zona central: enlaces primarios */}
        {!enAuth && (
          <nav className="nav-primary">
            {(esAdmin ? primaryAdmin : primaryStudent).map(({to,label,icon:Icon})=>(
              <Link key={to} to={to} className={`link ${isActive(to) ? 'is-active' : ''}`}>
                <Icon style={{marginRight:6}}/>{label}
              </Link>
            ))}
          </nav>
        )}

        {/* Acciones a la derecha */}
        <div className="nav-actions">
          {!enAuth && (
            <>
              {/* Accesibilidad siempre visible */}
              <Link to="/preferencias" className={`link ${isActive('/preferencias') ? 'is-active' : ''}`}>
                <I.Aa style={{marginRight:6}}/> Accesibilidad
              </Link>

              {/* Menú Admin (solo si es admin) */}
              {esAdmin && (
                <div className="menu">
                  <button
                    className="menu-button btn-ghost"
                    onClick={()=>setOpen(v=>!v)}
                    aria-expanded={open}
                    aria-haspopup="true"
                  >
                    Admin <I.Chevron style={{marginLeft:6, transform: open ? 'rotate(180deg)' : 'none'}}/>
                  </button>

                  {open && (
                    <div className="menu-panel" role="menu" onMouseLeave={()=>setOpen(false)}>
                      {secondaryAdmin.map(({to,label,icon:Icon})=>(
                        <Link key={to} to={to} role="menuitem" className="menu-item" onClick={()=>setOpen(false)}>
                          <Icon style={{marginRight:8}}/>{label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Toggle de tema */}
          <ThemeToggle className="link" />
        </div>
      </div>
    </div>
  );
}
