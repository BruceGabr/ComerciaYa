import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // NUEVO: Importar JWT
import connectDB from './../src/db/connection.js';
import { Registro, Usuario } from './../src/db/models.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// NUEVO: Verificar que JWT_SECRET existe
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno');
  process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
connectDB();

// NUEVO: Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }
  
  const token = authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Agregar datos del usuario al request
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

// Ruta de Registro (sin cambios significativos)
app.post('/api/register', async (req, res) => {
  try {
    console.log('--- Petición de registro recibida ---');
    console.log('Datos de registro:', req.body.correo);

    const { nombre, apellido, fechaNacimiento, genero, contacto, correo, contrasena } = req.body;

    // 1. Validar si el usuario ya existe
    const existingUser = await Usuario.findOne({ correo });
    if (existingUser) {
      console.log('Intento de registro con correo existente (409):', correo);
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    // 2. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // 3. Crear el nuevo registro en la colección Registro
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

    // 4. Crear el nuevo usuario en la colección Usuario
    const newUsuario = new Usuario({
      correo,
      contrasena: hashedPassword,
    });
    await newUsuario.save();

    console.log('!!! Usuario y Registro guardados con éxito para:', correo);
    res.status(201).json({ message: 'Usuario registrado con éxito.', userId: newUsuario._id });

  } catch (error) {
    console.error('*** Error al registrar usuario en backend:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar usuario.', error: error.message });
  }
});

// MODIFICADO: Ruta de Login con JWT
app.post('/api/login', async (req, res) => {
  try {
    console.log('--- Petición de login recibida ---');
    console.log('Intento de login para correo:', req.body.correo);

    const { correo, contraseña } = req.body;

    // 1. Buscar el usuario por correo
    const user = await Usuario.findOne({ correo });
    if (!user) {
      console.log('Fallo de login: Usuario no encontrado para correo:', correo);
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // 2. Comparar la contraseña proporcionada con la hasheada en la BD
    const isMatch = await bcrypt.compare(contraseña, user.contrasena);
    if (!isMatch) {
      console.log('Fallo de login: Contraseña incorrecta para correo:', correo);
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // NUEVO: 3. Generar JWT
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        correo: user.correo 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expira en 24 horas
    );

    console.log('!!! Inicio de sesión exitoso para usuario:', user.correo);
    
    // MODIFICADO: Respuesta incluye JWT
    res.status(200).json({ 
      message: 'Inicio de sesión exitoso.',
      token: token,
      user: { 
        id: user._id, 
        correo: user.correo 
      }
    });

  } catch (error) {
    console.error('*** Error al iniciar sesión en backend:', error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.', error: error.message });
  }
});

// NUEVO: Ruta para verificar si un usuario existe (para verificar sesión)
app.get('/api/user/verify/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el userId del token coincide con el solicitado
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

// NUEVO: Ruta para obtener perfil completo del usuario
app.get('/api/user/profile/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el userId del token coincide con el solicitado
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado para acceder a este perfil' });
    }
    
    // Buscar datos completos en la colección Registro
    const userProfile = await Registro.findOne({ correo: req.user.correo });
    
    if (!userProfile) {
      return res.status(404).json({ message: 'Perfil de usuario no encontrado' });
    }
    
    // Devolver datos sin la contraseña
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

// NUEVO: Ruta para actualizar perfil del usuario
app.put('/api/user/profile/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el userId del token coincide con el solicitado
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado para modificar este perfil' });
    }
    
    const { nombre, apellido, fechaNacimiento, genero, numeroTelefonico } = req.body;
    
    // Actualizar datos en la colección Registro
    const updatedProfile = await Registro.findOneAndUpdate(
      { correo: req.user.correo },
      {
        nombre,
        apellido,
        fechaNacimiento,
        genero,
        numeroTelefonico
      },
      { new: true } // Devolver el documento actualizado
    );
    
    if (!updatedProfile) {
      return res.status(404).json({ message: 'Perfil de usuario no encontrado' });
    }
    
    // Devolver datos actualizados sin la contraseña
    const profileData = {
      id: updatedProfile._id,
      nombre: updatedProfile.nombre,
      apellido: updatedProfile.apellido,
      fechaNacimiento: updatedProfile.fechaNacimiento,
      genero: updatedProfile.genero,
      numeroTelefonico: updatedProfile.numeroTelefonico,
      correo: updatedProfile.correo,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt
    };
    
    console.log('Perfil actualizado para usuario:', req.user.correo);
    res.status(200).json(profileData);
    
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});