// src/db/connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Asegúrate de que esta línea esté, si no lo está en server/index.js también
dotenv.config(); // Asegúrate de que esta línea esté para cargar la variable de entorno

const connectDB = async () => {
  try {
    // Utiliza la variable de entorno MONGODB_URI que acabamos de corregir
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log('Conexión a MongoDB establecida con éxito.');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1); // Salir del proceso con un error
  }
};

export default connectDB;