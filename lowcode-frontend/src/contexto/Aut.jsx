import { createContext, useContext, useEffect, useState } from 'react';
import cliente from '../api/cliente.js';
const Ctx = createContext();
export function ProveedorAut({ children }){
  const [usuario,setUsuario] = useState(null);
  useEffect(()=>{ const t=localStorage.getItem('token'); if(t){ cliente.get('/usuarios/mi-perfil').then(r=>setUsuario(r.data)).catch(()=>localStorage.removeItem('token')); } },[]);
  async function login(correo, contrasena){ const {data}=await cliente.post('/autenticacion/login',{correo,contrasena}); localStorage.setItem('token',data.token); setUsuario(data.usuario); }
  async function registro(nombre_completo, correo, contrasena){ const {data}=await cliente.post('/autenticacion/registro',{nombre_completo,correo,contrasena}); localStorage.setItem('token',data.token); setUsuario(data.usuario); }
  function salir(){ localStorage.removeItem('token'); setUsuario(null); }
  return <Ctx.Provider value={{usuario,login,registro,salir}}>{children}</Ctx.Provider>;
}
export const useAut=()=>useContext(Ctx);