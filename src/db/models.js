// src/db/models.js
import mongoose from 'mongoose';

// Schema para Registro
const registroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  genero: { type: String, required: true },
  numeroTelefonico: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
}, { timestamps: true }); // `timestamps` añade `createdAt` y `updatedAt` automáticamente

// Schema para Usuario
const usuarioSchema = new mongoose.Schema({
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
}, { timestamps: true });

// Schema para Emprendimiento
const emprendimientoSchema = new mongoose.Schema({
  nombreEmprendimiento: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  categoriaEmprendimiento: { type: String, required: true },
  // Referencia al Usuario que creó el emprendimiento
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
}, { timestamps: true });

// Schema para Producto
const productoSchema = new mongoose.Schema({
  nombreProducto: { type: String, required: true },
  descripcion: { type: String, required: true },
  valoracion: { type: Number, min: 0, max: 5, default: 0 },
  categoriaProducto: { type: String, required: true },
  // Referencia al Emprendimiento al que pertenece el producto
  emprendimiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Emprendimiento', required: true },
}, { timestamps: true });

// Creación de los modelos
export const Registro = mongoose.model('Registro', registroSchema);
export const Usuario = mongoose.model('Usuario', usuarioSchema);
export const Emprendimiento = mongoose.model('Emprendimiento', emprendimientoSchema);
export const Producto = mongoose.model('Producto', productoSchema);