import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Edit2, Trash2, Plus, Check, X, Search } from 'lucide-react';
import './App.css';

export default function App() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    setCargando(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) console.error('Error al cargar:', error);
    else setProductos(data || []);
    setCargando(false);
  }

  async function agregarProducto(e) {
    e.preventDefault();
    if (!nombre.trim() || !precio) return;

    const { error } = await supabase
      .from('productos')
      .insert([{ nombre: nombre.trim(), precio: parseFloat(precio) }]);

    if (error) {
      alert('Error al guardar el producto');
    } else {
      setNombre('');
      setPrecio('');
      cargarProductos();
    }
  }

  async function guardarEdicion(id) {
    if (!nuevoPrecio || isNaN(nuevoPrecio)) return;

    const { error } = await supabase
      .from('productos')
      .update({ precio: parseFloat(nuevoPrecio) })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar precio');
    } else {
      setEditandoId(null);
      setNuevoPrecio('');
      cargarProductos();
    }
  }

  async function eliminarProducto(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) cargarProductos();
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="contenedor">
      <header className="header">
        <h1>Almacén Familiar</h1>
        <p>Control de Precios y Stock</p>
      </header>

      {/* Formulario nuevo producto */}
      <form onSubmit={agregarProducto} className="card form-alta">
        <h3>Nuevo Producto</h3>
        <input
          type="text"
          placeholder="Nombre del producto (ej. Leche La Serenísima 1L)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <div className="fila-inputs">
          <input
            type="number"
            step="0.01"
            placeholder="Precio ($)"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
          <button type="submit" className="btn-primario">
            <Plus size={18} /> Agregar
          </button>
        </div>
      </form>

      {/* Buscador */}
      <div className="buscador-card">
        <Search size={18} color="#666" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Listado de productos */}
      <main className="lista">
        {cargando ? (
          <p className="centrado">Cargando catálogo...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="centrado">No hay productos registrados.</p>
        ) : (
          productosFiltrados.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-info">
                <span className="item-nombre">{item.nombre}</span>
                {editandoId === item.id ? (
                  <div className="edicion-box">
                    <span>$</span>
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(e.target.value)}
                    />
                    <button
                      className="btn-icono btn-verde"
                      onClick={() => guardarEdicion(item.id)}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      className="btn-icono btn-gris"
                      onClick={() => setEditandoId(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <span className="item-precio">
                    ${Number(item.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {editandoId !== item.id && (
                <div className="item-acciones">
                  <button
                    className="btn-icono btn-azul"
                    onClick={() => {
                      setEditandoId(item.id);
                      setNuevoPrecio(item.precio);
                    }}
                    title="Modificar precio"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icono btn-rojo"
                    onClick={() => eliminarProducto(item.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}