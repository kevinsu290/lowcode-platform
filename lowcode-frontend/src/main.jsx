import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAut, useAut } from './contexto/Aut.jsx';

import Login from './paginas/Login.jsx';
import Registro from './paginas/Registro.jsx';
import InicioEstudiante from './paginas/InicioEstudiante.jsx';
import ListaEjercicios from './paginas/ListaEjercicios.jsx';
import JugarEjercicio from './paginas/JugarEjercicio.jsx';
import ListaEncuestas from './paginas/ListaEncuestas.jsx';
import TomarEncuesta from './paginas/TomarEncuesta.jsx';
import Preferencias from './paginas/Preferencias.jsx';

import AdminInicio from './paginas/AdminInicio.jsx';        
import AdminAnalitica from './paginas/AdminAnalitica.jsx';
import AdminEjercicios from './paginas/AdminEjercicios.jsx';
import AdminEncuestas from './paginas/EncuestasAdmin.jsx';
import Diagnostico from './paginas/Diagnostico.jsx';
import AdminRegistrar from './paginas/AdminRegistrar.jsx';

import './styles/theme.css';

function Protegida({ children, roles }) {
  const { usuario } = useAut();
  if (!usuario) return <Navigate to="/login" replace />;

  const esAdmin = usuario?.rol === 'admin' || usuario?.rol_id === 1;
  if (roles && roles.length) {
    if (roles.includes('admin') && !esAdmin) return <Navigate to="/" replace />;
  }
  return children;
}

/** Decide el home según el rol */
function HomePorRol() {
  const { usuario } = useAut();
  const esAdmin = usuario?.rol === 'admin' || usuario?.rol_id === 1;
  return esAdmin ? <AdminInicio/> : <InicioEstudiante/>;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProveedorAut>
        <Routes>
          {/* Público */}
          <Route path="/login" element={<Login/>} />
          <Route path="/registro" element={<Registro/>} />

          {/* Home por rol */}
          <Route path="/" element={<Protegida><HomePorRol/></Protegida>} />

          {/* Estudiante */}
          <Route path="/ejercicios" element={<Protegida><ListaEjercicios/></Protegida>} />
          <Route path="/jugar" element={<Protegida><JugarEjercicio/></Protegida>} />
          <Route path="/encuestas" element={<Protegida><ListaEncuestas/></Protegida>} />
          <Route path="/encuestas/tomar" element={<Protegida><TomarEncuesta/></Protegida>} />
          <Route path="/preferencias" element={<Protegida><Preferencias/></Protegida>} />

          {/* Admin */}
          <Route path="/admin/analitica" element={<Protegida roles={['admin']}><AdminAnalitica/></Protegida>} />
          <Route path="/admin/encuestas" element={<Protegida roles={['admin']}><AdminEncuestas/></Protegida>} />
          <Route path="/admin/ejercicios" element={<Protegida roles={['admin']}><AdminEjercicios/></Protegida>} />
          

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/diagnostico" element={<Diagnostico/>} />
          <Route path="/admin/registrar" element={<AdminRegistrar/>} />
        </Routes>
      </ProveedorAut>
    </BrowserRouter>
  </React.StrictMode>
);
  