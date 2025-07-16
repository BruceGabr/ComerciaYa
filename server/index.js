import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import connectDB from './../src/db/connection.js';
import { Registro, Usuario, Emprendimiento, Producto, Valoracion, CATEGORIAS_EMPRENDIMIENTOS } from './../src/db/models.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { body, validationResult } from 'express-validator';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'comerciaya',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 5000;

// Verificar que JWT_SECRET existe
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno');
  process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verificando token:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    } else {
      return res.status(401).json({ message: 'Error de autenticación' });
    }
  }
};

// Función helper para normalizar texto (sin tildes, minúsculas)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remover tildes
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Ruta de Registro
app.post('/api/register', [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .notEmpty().withMessage('El apellido es obligatorio')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/).withMessage('El apellido solo puede contener letras y espacios'),

  body('fechaNacimiento').custom(value => {
    if (!value?.dia || !value?.mes || !value?.año) {
      throw new Error('Fecha de nacimiento incompleta');
    }
    const fecha = new Date(`${value.año}-${value.mes}-${value.dia}`);
    const hoy = new Date();
    if (isNaN(fecha.getTime()) || fecha > hoy) {
      throw new Error('Fecha de nacimiento inválida o en el futuro');
    }
    return true;
  }),

  body('genero')
    .notEmpty().withMessage('El género es obligatorio'),

  body('contacto')
    .notEmpty().withMessage('El número telefónico es obligatorio')
    .isMobilePhone('any').withMessage('Número telefónico inválido'),

  body('correo')
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Correo electrónico inválido'),

  body('contrasena')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
  }

  try {
    const { nombre, apellido, fechaNacimiento, genero, contacto, correo, contrasena } = req.body;

    const existingUser = await Usuario.findOne({ correo });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const newRegistro = new Registro({
      nombre,
      apellido,
      fechaNacimiento: new Date(`${fechaNacimiento.año}-${fechaNacimiento.mes}-${fechaNacimiento.dia}`),
      genero,
      numeroTelefonico: contacto,
      correo,
      contrasena: hashedPassword,
    });
    await newRegistro.save();

    const newUsuario = new Usuario({ correo, contrasena: hashedPassword });
    await newUsuario.save();

    res.status(201).json({ message: 'Usuario registrado con éxito.', userId: newUsuario._id });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor al registrar usuario.', error: error.message });
  }
});



// ==================== RUTAS DE USUARIO ====================
app.post('/api/login', [
  body('correo')
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Correo electrónico inválido'),

  body('contraseña')
    .notEmpty().withMessage('La contraseña es obligatoria')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
  }

  try {
    const { correo, contraseña } = req.body;

    const user = await Usuario.findOne({ correo });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(contraseña, user.contrasena);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: { id: user._id, correo: user.correo }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.', error: error.message });
  }
});

// Verificar usuario
app.get('/api/user/verify/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado para acceder a este usuario' });
    }

    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Usuario verificado',
      user: { id: user._id, correo: user.correo }
    });

  } catch (error) {
    console.error('Error verificando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario
app.get('/api/user/profile/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado para acceder a este perfil' });
    }

    const userProfile = await Registro.findOne({ correo: req.user.correo });

    if (!userProfile) {
      return res.status(404).json({ message: 'Perfil de usuario no encontrado' });
    }

    const profileData = {
      id: userProfile._id,
      nombre: userProfile.nombre,
      apellido: userProfile.apellido,
      fechaNacimiento: userProfile.fechaNacimiento,
      genero: userProfile.genero,
      numeroTelefonico: userProfile.numeroTelefonico,
      correo: userProfile.correo,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    };

    console.log('Perfil cargado para usuario:', req.user.correo);
    res.status(200).json(profileData);

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar perfil del usuario
app.put('/api/user/profile/:userId', verifyToken, upload.single('imagen'), [
  body('nombre').optional().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/).withMessage('Nombre inválido'),
  body('apellido').optional().matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/).withMessage('Apellido inválido'),
  body('fechaNacimiento').optional().custom(value => {
    const fecha = new Date(value);
    // Verificar que la fecha no sea "Invalid Date" y no esté en el futuro
    if (isNaN(fecha.getTime()) || fecha > new Date()) {
      throw new Error('Fecha de nacimiento inválida o en el futuro');
    }
    return true;
  }),
  // ¡¡CAMBIO AQUÍ: Validaciones de género para que coincidan con el frontend!!
  body('genero').optional().isIn(['Mujer', 'Hombre', 'Sin Especificar']).withMessage('Género inválido'),
  body('numeroTelefonico').optional().isMobilePhone('any').withMessage('Teléfono inválido')
], async (req, res) => {
  const { userId } = req.params;

  if (req.user.userId !== userId) {
    return res.status(403).json({ message: 'No autorizado para modificar este perfil' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Error de validación al actualizar perfil:', errors.array()); // Log de errores de validación
    return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
  }

  try {
    const { nombre, apellido, fechaNacimiento, genero, numeroTelefonico } = req.body;
    const imagenUrl = req.file?.path; // URL de Cloudinary si la imagen fue enviada

    // Construir el objeto de actualización solo con los campos presentes
    const updateFields = {};
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (apellido !== undefined) updateFields.apellido = apellido;
    // Asegurarse de que fechaNacimiento se convierte a Date solo si está presente
    if (fechaNacimiento !== undefined) updateFields.fechaNacimiento = new Date(fechaNacimiento);
    if (genero !== undefined) updateFields.genero = genero;
    if (numeroTelefonico !== undefined) updateFields.numeroTelefonico = numeroTelefonico;
    if (imagenUrl !== undefined) updateFields.imagenUrl = imagenUrl; // Solo si se subió imagen

    const updatedProfile = await Registro.findOneAndUpdate(
      { correo: req.user.correo }, // Busca el perfil por el correo del usuario autenticado
      updateFields, // Usa el objeto con los campos a actualizar
      { new: true, runValidators: true } // `new: true` para devolver el documento actualizado, `runValidators: true` para ejecutar las validaciones del schema de Mongoose
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    const profileData = {
      id: updatedProfile._id,
      nombre: updatedProfile.nombre,
      apellido: updatedProfile.apellido,
      fechaNacimiento: updatedProfile.fechaNacimiento,
      genero: updatedProfile.genero,
      numeroTelefonico: updatedProfile.numeroTelefonico,
      correo: updatedProfile.correo,
      imagenUrl: updatedProfile.imagenUrl,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt
    };

    console.log('Perfil actualizado con éxito para usuario:', req.user.correo);
    res.status(200).json(profileData);

  } catch (error) {
    console.error('Error detallado al actualizar perfil:', error); // Mensaje de error más detallado en la consola del servidor
    res.status(500).json({ message: 'Error interno del servidor', details: error.message }); // Envía el mensaje de error al frontend para depuración (considera eliminar en producción)
  }
});


// ==================== RUTA PARA SUBIR IMAGEN A CLOUDINARY ====================
app.post('/api/upload/emprendimiento', verifyToken, upload.single('imagen'), async (req, res) => {
  try {
    const imageUrl = req.file.path; // URL pública de la imagen en Cloudinary
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen', error: error.message });
  }
});

// ==================== RUTAS DE EMPRENDIMIENTOS ====================

// Obtener categorías disponibles
app.get('/api/emprendimientos/categorias', (req, res) => {
  res.status(200).json(CATEGORIAS_EMPRENDIMIENTOS);
});

// Crear emprendimiento
app.post('/api/emprendimientos', verifyToken, async (req, res) => {
  try {
    const { nombreEmprendimiento, descripcion, categoriaEmprendimiento } = req.body;

    // Validar que la categoría existe
    if (!CATEGORIAS_EMPRENDIMIENTOS.includes(categoriaEmprendimiento)) {
      return res.status(400).json({ message: 'Categoría no válida' });
    }

    // Obtener el usuario completo
    const usuario = await Usuario.findById(req.user.userId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const nuevoEmprendimiento = new Emprendimiento({
      nombreEmprendimiento,
      descripcion,
      categoriaEmprendimiento,
      usuario: usuario._id
    });

    await nuevoEmprendimiento.save();

    // Poblar con datos del usuario para la respuesta
    await nuevoEmprendimiento.populate('usuario', 'correo');

    console.log('Emprendimiento creado:', nombreEmprendimiento, 'por:', req.user.correo);
    res.status(201).json({
      message: 'Emprendimiento creado exitosamente',
      emprendimiento: nuevoEmprendimiento
    });

  } catch (error) {
    console.error('Error creando emprendimiento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener emprendimientos del usuario autenticado
app.get('/api/emprendimientos/mis-emprendimientos', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.userId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const emprendimientos = await Emprendimiento.find({
      usuario: usuario._id,
      activo: true
    })
      .populate('usuario', 'correo')
      .sort({ createdAt: -1 });

    res.status(200).json(emprendimientos);

  } catch (error) {
    console.error('Error obteniendo emprendimientos del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todos los emprendimientos (para explorar)
app.get('/api/emprendimientos', async (req, res) => {
  try {
    const { busqueda, categoria, orden = 'popularidad' } = req.query;

    let filtros = { activo: true };

    // Filtro por categoría
    if (categoria && categoria !== 'todas') {
      filtros.categoriaEmprendimiento = categoria;
    }

    // Filtro por búsqueda (nombre)
    if (busqueda) {
      const busquedaNormalizada = normalizeText(busqueda);
      filtros.$or = [
        { nombreEmprendimiento: { $regex: busquedaNormalizada, $options: 'i' } }
      ];
    }

    // Configurar ordenamiento
    let ordenamiento = {};
    switch (orden) {
      case 'popularidad':
        ordenamiento = { totalValoraciones: -1, promedioValoraciones: -1 };
        break;
      case 'recientes':
        ordenamiento = { createdAt: -1 };
        break;
      case 'alfabetico':
        ordenamiento = { nombreEmprendimiento: 1 };
        break;
      case 'mejor_valorados':
        ordenamiento = { promedioValoraciones: -1, totalValoraciones: -1 };
        break;
      default:
        ordenamiento = { totalValoraciones: -1, promedioValoraciones: -1 };
    }

    const emprendimientos = await Emprendimiento.find(filtros)
      .populate('usuario', 'correo')
      .sort(ordenamiento)
      .lean();

    res.status(200).json(emprendimientos);

  } catch (error) {
    console.error('Error obteniendo emprendimientos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener emprendimiento por ID
app.get('/api/emprendimientos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const emprendimiento = await Emprendimiento.findOne({ _id: id, activo: true })
      .populate('usuario', 'correo');

    if (!emprendimiento) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }

    res.status(200).json(emprendimiento);

  } catch (error) {
    console.error('Error obteniendo emprendimiento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar emprendimiento
app.put('/api/emprendimientos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreEmprendimiento, descripcion, categoriaEmprendimiento } = req.body;

    // Validar que la categoría existe
    if (!CATEGORIAS_EMPRENDIMIENTOS.includes(categoriaEmprendimiento)) {
      return res.status(400).json({ message: 'Categoría no válida' });
    }

    const usuario = await Usuario.findById(req.user.userId);

    const emprendimiento = await Emprendimiento.findOneAndUpdate(
      { _id: id, usuario: usuario._id, activo: true },
      { nombreEmprendimiento, descripcion, categoriaEmprendimiento },
      { new: true }
    ).populate('usuario', 'correo');

    if (!emprendimiento) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado o no autorizado' });
    }

    console.log('Emprendimiento actualizado:', id, 'por:', req.user.correo);
    res.status(200).json({
      message: 'Emprendimiento actualizado exitosamente',
      emprendimiento
    });

  } catch (error) {
    console.error('Error actualizando emprendimiento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar emprendimiento (soft delete)
app.delete('/api/emprendimientos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(req.user.userId);

    const emprendimiento = await Emprendimiento.findOneAndUpdate(
      { _id: id, usuario: usuario._id, activo: true },
      { activo: false },
      { new: true }
    );

    if (!emprendimiento) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado o no autorizado' });
    }

    // También desactivar productos asociados
    await Producto.updateMany(
      { emprendimiento: id },
      { activo: false }
    );

    console.log('Emprendimiento eliminado:', id, 'por:', req.user.correo);
    res.status(200).json({ message: 'Emprendimiento eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando emprendimiento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ==================== RUTAS DE PRODUCTOS/SERVICIOS ====================

// Crear producto/servicio
app.post('/api/productos', verifyToken, async (req, res) => {
  try {
    const { nombreProducto, descripcion, tipo, emprendimientoId } = req.body;

    // Validar que el tipo es válido
    if (!['producto', 'servicio'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo debe ser "producto" o "servicio"' });
    }

    // Verificar que el emprendimiento existe y pertenece al usuario
    const usuario = await Usuario.findById(req.user.userId);
    const emprendimiento = await Emprendimiento.findOne({
      _id: emprendimientoId,
      usuario: usuario._id,
      activo: true
    });

    if (!emprendimiento) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado o no autorizado' });
    }

    const nuevoProducto = new Producto({
      nombreProducto,
      descripcion,
      tipo,
      emprendimiento
    });

    await nuevoProducto.save();
    await nuevoProducto.populate('emprendimiento', 'nombreEmprendimiento');

    console.log('Producto/servicio creado:', nombreProducto, 'por:', req.user.correo);
    res.status(201).json({
      message: 'Producto/servicio creado exitosamente',
      producto: nuevoProducto
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener productos/servicios de un emprendimiento
app.get('/api/productos/emprendimiento/:emprendimientoId', async (req, res) => {
  try {
    const { emprendimientoId } = req.params;

    const productos = await Producto.find({
      emprendimiento: emprendimientoId,
      activo: true
    })
      .populate('emprendimiento', 'nombreEmprendimiento')
      .sort({ createdAt: -1 });

    res.status(200).json(productos);

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener productos/servicios del usuario autenticado
app.get('/api/productos/mis-productos', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.userId);

    // Primero obtener los emprendimientos del usuario
    const emprendimientos = await Emprendimiento.find({
      usuario: usuario._id,
      activo: true
    }).select('_id');

    const emprendimientoIds = emprendimientos.map(emp => emp._id);

    const productos = await Producto.find({
      emprendimiento: { $in: emprendimientoIds },
      activo: true
    })
      .populate('emprendimiento', 'nombreEmprendimiento')
      .sort({ createdAt: -1 });

    res.status(200).json(productos);

  } catch (error) {
    console.error('Error obteniendo productos del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar producto/servicio
app.put('/api/productos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreProducto, descripcion, tipo } = req.body;

    // Validar que el tipo es válido
    if (!['producto', 'servicio'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo debe ser "producto" o "servicio"' });
    }

    const usuario = await Usuario.findById(req.user.userId);

    // Verificar que el producto pertenece a un emprendimiento del usuario
    const producto = await Producto.findOne({ _id: id, activo: true })
      .populate('emprendimiento');

    if (!producto || producto.emprendimiento.usuario.toString() !== usuario._id.toString()) {
      return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
    }

    producto.nombreProducto = nombreProducto;
    producto.descripcion = descripcion;
    producto.tipo = tipo;

    await producto.save();
    await producto.populate('emprendimiento', 'nombreEmprendimiento');

    console.log('Producto actualizado:', id, 'por:', req.user.correo);
    res.status(200).json({
      message: 'Producto/servicio actualizado exitosamente',
      producto
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar producto/servicio (soft delete)
app.delete('/api/productos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(req.user.userId);

    // Verificar que el producto pertenece a un emprendimiento del usuario
    const producto = await Producto.findOne({ _id: id, activo: true })
      .populate('emprendimiento');

    if (!producto || producto.emprendimiento.usuario.toString() !== usuario._id.toString()) {
      return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
    }

    producto.activo = false;
    await producto.save();

    console.log('Producto eliminado:', id, 'por:', req.user.correo);
    res.status(200).json({ message: 'Producto/servicio eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ==================== RUTAS DE VALORACIONES ====================

// Crear valoración
app.post('/api/valoraciones', verifyToken, async (req, res) => {
  try {
    const { emprendimientoId, puntuacion, comentario } = req.body;

    // Validar puntuación
    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ message: 'La puntuación debe estar entre 1 y 5' });
    }

    // Verificar que el emprendimiento existe
    const emprendimiento = await Emprendimiento.findOne({ _id: emprendimientoId, activo: true });
    if (!emprendimiento) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }

    // Verificar que el usuario no sea el dueño del emprendimiento
    const usuario = await Usuario.findById(req.user.userId);
    if (emprendimiento.usuario.toString() === usuario._id.toString()) {
      return res.status(403).json({ message: 'No puedes valorar tu propio emprendimiento' });
    }

    // Verificar si ya existe una valoración del usuario para este emprendimiento
    const valoracionExistente = await Valoracion.findOne({
      emprendimiento: emprendimientoId,
      usuario: usuario._id
    });

    if (valoracionExistente) {
      return res.status(409).json({ message: 'Ya has valorado este emprendimiento' });
    }

    const nuevaValoracion = new Valoracion({
      emprendimiento: emprendimientoId,
      usuario: usuario._id,
      puntuacion,
      comentario
    });

    await nuevaValoracion.save();
    await nuevaValoracion.populate([
      { path: 'usuario', select: 'correo' },
      { path: 'emprendimiento', select: 'nombreEmprendimiento' }
    ]);

    console.log('Valoración creada para emprendimiento:', emprendimientoId, 'por:', req.user.correo);
    res.status(201).json({
      message: 'Valoración creada exitosamente',
      valoracion: nuevaValoracion
    });

  } catch (error) {
    console.error('Error creando valoración:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener valoraciones de un emprendimiento
app.get('/api/valoraciones/emprendimiento/:emprendimientoId', async (req, res) => {
  try {
    const { emprendimientoId } = req.params;

    const valoraciones = await Valoracion.find({ emprendimiento: emprendimientoId })
      .populate('usuario', 'correo')
      .sort({ createdAt: -1 });

    res.status(200).json(valoraciones);

  } catch (error) {
    console.error('Error obteniendo valoraciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar valoración
app.put('/api/valoraciones/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { puntuacion, comentario } = req.body;

    // Validar puntuación
    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ message: 'La puntuación debe estar entre 1 y 5' });
    }

    const usuario = await Usuario.findById(req.user.userId);

    const valoracion = await Valoracion.findOneAndUpdate(
      { _id: id, usuario: usuario._id },
      { puntuacion, comentario },
      { new: true }
    ).populate([
      { path: 'usuario', select: 'correo' },
      { path: 'emprendimiento', select: 'nombreEmprendimiento' }
    ]);

    if (!valoracion) {
      return res.status(404).json({ message: 'Valoración no encontrada o no autorizada' });
    }

    console.log('Valoración actualizada:', id, 'por:', req.user.correo);
    res.status(200).json({
      message: 'Valoración actualizada exitosamente',
      valoracion
    });

  } catch (error) {
    console.error('Error actualizando valoración:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar valoración
app.delete('/api/valoraciones/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(req.user.userId);

    const valoracion = await Valoracion.findOneAndDelete({
      _id: id,
      usuario: usuario._id
    });

    if (!valoracion) {
      return res.status(404).json({ message: 'Valoración no encontrada o no autorizada' });
    }

    console.log('Valoración eliminada:', id, 'por:', req.user.correo);
    res.status(200).json({ message: 'Valoración eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando valoración:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ==================== SUBIDA DE IMÁGENES ====================

// Imagen para emprendimiento
app.post('/api/emprendimientos/:id/imagen', verifyToken, upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;

    const emprendimiento = await Emprendimiento.findOneAndUpdate(
      { _id: id, usuario: req.user.userId },
      { imagenUrl: req.file.path },
      { new: true }
    );

    if (!emprendimiento) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado o no autorizado' });
    }

    res.status(200).json({ message: 'Imagen subida correctamente', imagenUrl: emprendimiento.imagenUrl });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Imagen para producto/servicio
app.post('/api/productos/:id/imagen', verifyToken, upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id).populate('emprendimiento');

    if (!producto || producto.emprendimiento.usuario.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
    }

    producto.imagenUrl = req.file.path;
    await producto.save();

    res.status(200).json({ message: 'Imagen subida correctamente', imagenUrl: producto.imagenUrl });
  } catch (error) {
    console.error('Error al subir imagen de producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Imagen de perfil de usuario
app.post('/api/usuarios/:userId/imagen', verifyToken, upload.single('imagen'), async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado para modificar este perfil' });
    }

    const registro = await Registro.findOneAndUpdate(
      { correo: req.user.correo },
      { imagenUrl: req.file.path },
      { new: true }
    );

    if (!registro) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    res.status(200).json({ message: 'Imagen de perfil subida correctamente', imagenUrl: registro.imagenUrl });
  } catch (error) {
    console.error('Error al subir imagen de usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});