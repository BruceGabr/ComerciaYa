// src/db/models.js
import mongoose from 'mongoose';

// Lista de categorías predefinidas
export const CATEGORIAS_EMPRENDIMIENTOS = [
  'Ropa y Accesorios',
  'Hogar y Decoración',
  'Tecnología',
  'Comidas y Bebidas',
  'Artesanías',
  'Servicios Profesionales',
  'Educación y Capacitación',
  'Salud y Bienestar',
  'Belleza y Cuidado Personal',
  'Entretenimiento y Eventos',
  'Agricultura',
  'Mascotas y Veterinaria',
  'Turismo',
  'Transporte y Logística',
  'Deportes y Recreación',
  'Construcción',
  'Otro'
];

// Schema para Registro
const registroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  genero: { type: String, required: true },
  numeroTelefonico: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
}, { timestamps: true });

// Schema para Usuario
const usuarioSchema = new mongoose.Schema({
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
}, { timestamps: true });

// Schema para Emprendimiento (ACTUALIZADO)
const emprendimientoSchema = new mongoose.Schema({
  nombreEmprendimiento: { type: String, required: true },
  descripcion: { type: String, required: true },
  categoriaEmprendimiento: {
    type: String,
    required: true,
    enum: CATEGORIAS_EMPRENDIMIENTOS
  },
  // Referencia al Usuario que creó el emprendimiento
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  // Campos para popularidad y valoraciones
  totalValoraciones: { type: Number, default: 0 },
  promedioValoraciones: { type: Number, default: 0, min: 0, max: 5 },
  activo: { type: Boolean, default: true }, // Para soft delete
}, { timestamps: true });

// Schema para Producto/Servicio (ACTUALIZADO)
const productoSchema = new mongoose.Schema({
  nombreProducto: { type: String, required: true },
  descripcion: { type: String, required: true },
  tipo: {
    type: String,
    required: true,
    enum: ['producto', 'servicio'],
    default: 'producto'
  },
  // Referencia al Emprendimiento al que pertenece
  emprendimiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Emprendimiento', required: true },
  activo: { type: Boolean, default: true }, // Para soft delete
}, { timestamps: true });

// NUEVO: Schema para Valoraciones
const valoracionSchema = new mongoose.Schema({
  // Referencia al emprendimiento valorado
  emprendimiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Emprendimiento', required: true },
  // Referencia al usuario que hace la valoración
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  // Puntuación de 1 a 5 estrellas
  puntuacion: { type: Number, required: true, min: 1, max: 5 },
  // Comentario opcional
  comentario: { type: String, maxlength: 500 },
  // Para evitar valoraciones duplicadas del mismo usuario al mismo emprendimiento
}, { timestamps: true });

// Índice compuesto para evitar valoraciones duplicadas
valoracionSchema.index({ emprendimiento: 1, usuario: 1 }, { unique: true });

// Middleware para actualizar las estadísticas del emprendimiento cuando se crea/actualiza/elimina una valoración
valoracionSchema.post('save', async function () {
  await actualizarEstadisticasEmprendimiento(this.emprendimiento);
});

valoracionSchema.post('remove', async function () {
  await actualizarEstadisticasEmprendimiento(this.emprendimiento);
});

// Función para actualizar estadísticas de valoraciones
async function actualizarEstadisticasEmprendimiento(emprendimientoId) {
  const Valoracion = mongoose.model('Valoracion');
  const Emprendimiento = mongoose.model('Emprendimiento');

  const stats = await Valoracion.aggregate([
    { $match: { emprendimiento: emprendimientoId } },
    {
      $group: {
        _id: null,
        totalValoraciones: { $sum: 1 },
        promedioValoraciones: { $avg: '$puntuacion' }
      }
    }
  ]);

  const emprendimiento = await Emprendimiento.findById(emprendimientoId);
  if (emprendimiento) {
    if (stats.length > 0) {
      emprendimiento.totalValoraciones = stats[0].totalValoraciones;
      emprendimiento.promedioValoraciones = Math.round(stats[0].promedioValoraciones * 10) / 10; // Redondear a 1 decimal
    } else {
      emprendimiento.totalValoraciones = 0;
      emprendimiento.promedioValoraciones = 0;
    }
    await emprendimiento.save();
  }
}

// Creación de los modelos
export const Registro = mongoose.model('Registro', registroSchema);
export const Usuario = mongoose.model('Usuario', usuarioSchema);
export const Emprendimiento = mongoose.model('Emprendimiento', emprendimientoSchema);
export const Producto = mongoose.model('Producto', productoSchema);
export const Valoracion = mongoose.model('Valoracion', valoracionSchema);