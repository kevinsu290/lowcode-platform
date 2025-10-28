// src/components/AdminSidebar.jsx
import { NavLink } from 'react-router-dom';

const Item = ({to, icon, label}) => (
  <NavLink className={({isActive}) => `item ${isActive?'is-active':''}`} to={to}>
    {icon}<span>{label}</span>
  </NavLink>
);

export default function AdminSidebar(){
  return (
    <>
      <div className="group">
        <div className="group-title">Panel</div>
        <Item to="/admin/inicio" label="Resumen" icon={<span>📊</span>} />
        <Item to="/admin/analitica" label="Analítica" icon={<span>📈</span>} />
      </div>
      <div className="group">
        <div className="group-title">Contenido</div>
        <Item to="/admin/ejercicios" label="Ejercicios" icon={<span>🧩</span>} />
        <Item to="/admin/encuestas" label="Encuestas" icon={<span>📝</span>} />
      </div>
      <div className="group">
        <div className="group-title">Usuarios</div>
        <Item to="/admin/usuarios" label="Estudiantes" icon={<span>👤</span>} />
      </div>
    </>
  );
}
