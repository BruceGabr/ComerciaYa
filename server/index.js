import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Para cargar variables de entorno
import connectDB from './../src/db/connection.js'; // Ajusta la ruta si es necesario
import { Registro, Usuario } from './../src/db/models.js'; // Ajusta la ruta
import bcrypt from 'bcryptjs';

dotenv.config(); // Carga las variables de entorno del archivo .env

const app = express();
const PORT = process.env.PORT || 5000; // Usa el puerto 5000 por defecto o el de la variable de entorno

// Middlewares
app.use(cors()); // Habilita CORS para permitir peticiones desde tu frontend
app.use(express.json()); // Habilita el parseo de JSON en el cuerpo de las peticiones

// Conectar a la base de datos
connectDB();

// Rutas de API
// Ruta de Registro
app.post('/api/register', async (req, res) => {
  try {
    // --- NUEVOS LOGS AGREGADOS AQUÍ ---
    console.log('--- Petición de registro recibida ---');
    console.log('Datos de registro:', req.body.correo); // Puedes loguear el correo para identificar

    const { nombre, apellido, fechaNacimiento, genero, contacto, correo, contrasena } = req.body;

    // 1. Validar si el usuario ya existe
    const existingUser = await Usuario.findOne({ correo });
    if (existingUser) {
      console.log('Intento de registro con correo existente (409):', correo); // Log para este caso
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

    // --- LOG DE ÉXITO DE REGISTRO ---
    console.log('!!! Usuario y Registro guardados con éxito para:', correo);
    res.status(201).json({ message: 'Usuario registrado con éxito.', userId: newUsuario._id });

  } catch (error) {
    console.error('*** Error al registrar usuario en backend:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar usuario.', error: error.message });
  }
});

// Ruta de Login
app.post('/api/login', async (req, res) => {
  try {
    // --- NUEVOS LOGS AGREGADOS AQUÍ ---
    console.log('--- Petición de login recibida ---');
    console.log('Intento de login para correo:', req.body.correo);

    const { correo, contraseña } = req.body;

    // 1. Buscar el usuario por correo
    const user = await Usuario.findOne({ correo });
    if (!user) {
      console.log('Fallo de login: Usuario no encontrado para correo:', correo); // Log para este caso
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // 2. Comparar la contraseña proporcionada con la hasheada en la BD
    const isMatch = await bcrypt.compare(contraseña, user.contrasena);
    if (!isMatch) {
      console.log('Fallo de login: Contraseña incorrecta para correo:', correo); // Log para este caso
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // --- LOG DE ÉXITO DE LOGIN ---
    console.log('!!! Inicio de sesión exitoso para usuario:', user.correo);
    res.status(200).json({ message: 'Inicio de sesión exitoso.', user: { id: user._id, correo: user.correo } });

  } catch (error) {
    console.error('*** Error al iniciar sesión en backend:', error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.', error: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});