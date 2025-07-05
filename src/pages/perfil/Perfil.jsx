import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { scrollToTop } from "../../components/scrollToTop/ScrollToTop";
import "./Perfil.css";

function Perfil() {
  const { user, getUserProfile, updateUserProfile, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos del formulario de edición
  const [editData, setEditData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    genero: "",
    numeroTelefonico: ""
  });

  // Cargar datos del perfil cuando la autenticación esté completa
  useEffect(() => {
    scrollToTop();
    
    // Esperar a que termine la verificación de autenticación
    if (authLoading) {
      console.log("AuthContext aún cargando...");
      return;
    }
    
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
      console.log("Usuario no autenticado, redirigiendo al login");
      navigate("/login");
      return;
    }
    
    // Si está autenticado, cargar el perfil
    console.log("Usuario autenticado, cargando perfil para:", user.correo);
    loadProfile();
  }, [authLoading, isAuthenticated, user, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Iniciando carga de perfil...");
      const profile = await getUserProfile();
      setProfileData(profile);
      
      // Preparar datos para edición - corregir el formato de fecha
      const formattedBirthDate = profile.fechaNacimiento ? 
        formatDateForInput(profile.fechaNacimiento) : "";
      
      setEditData({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        fechaNacimiento: formattedBirthDate,
        genero: profile.genero || "",
        numeroTelefonico: profile.numeroTelefonico || ""
      });
      
      console.log("Perfil cargado exitosamente:", profile);
    } catch (err) {
      console.error("Error cargando perfil:", err);
      setError("Error al cargar el perfil. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fecha para el input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    return datePart;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
    
    // Restaurar datos originales
    const formattedBirthDate = profileData.fechaNacimiento ? 
      formatDateForInput(profileData.fechaNacimiento) : "";
    
    setEditData({
      nombre: profileData.nombre || "",
      apellido: profileData.apellido || "",
      fechaNacimiento: formattedBirthDate,
      genero: profileData.genero || "",
      numeroTelefonico: profileData.numeroTelefonico || ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      // Validar datos antes de enviar
      if (!editData.nombre || !editData.apellido || !editData.fechaNacimiento) {
        setError("Por favor, completa todos los campos obligatorios.");
        return;
      }

      // Validar edad mínima usando componentes de fecha
      const [year, month, day] = editData.fechaNacimiento.split('-');
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 17) {
        setError("Debes tener al menos 17 años.");
        return;
      }

      const updatedProfile = await updateUserProfile(editData);
      
      setProfileData(updatedProfile);
      setSuccessMessage("Perfil actualizado exitosamente.");
      setIsEditing(false);
      
      console.log("Perfil actualizado:", updatedProfile);
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setError("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función corregida para formatear fechas para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    
    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    
    // Crear fecha usando los componentes individuales
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función corregida para calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return "No especificado";
    
    const today = new Date();
    // Usar la misma lógica para evitar problemas de zona horaria
    const datePart = birthDate.split('T')[0];
    const [year, month, day] = datePart.split('-');
    const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="perfil-container">
        <div className="perfil-loading">
          <div className="loading-spinner"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar mensaje (aunque debería redirigir)
  if (!isAuthenticated || !user) {
    return (
      <div className="perfil-container">
        <div className="perfil-error">
          <h3>Acceso denegado</h3>
          <p>Debes iniciar sesión para acceder a tu perfil.</p>
          <button onClick={() => navigate("/login")} className="btn-retry">
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se carga el perfil
  if (loading) {
    return (
      <div className="perfil-container">
        <div className="perfil-loading">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Si hay error cargando el perfil
  if (!profileData && error) {
    return (
      <div className="perfil-container">
        <div className="perfil-error">
          <h3>Error al cargar el perfil</h3>
          <p>{error}</p>
          <button onClick={loadProfile} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay datos del perfil por alguna razón
  if (!profileData) {
    return (
      <div className="perfil-container">
        <div className="perfil-error">
          <h3>No se encontraron datos del perfil</h3>
          <p>No se pudieron cargar los datos de tu perfil.</p>
          <button onClick={loadProfile} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <p>Administra tu información personal</p>
      </div>

      <div className="perfil-card">
        {/* Información básica del usuario */}
        <div className="perfil-section">
          <div className="section-header">
            <h2>Información Personal</h2>
            {!isEditing && (
              <button onClick={handleEdit} className="btn-edit">
                Editar
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="perfil-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={editData.nombre}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={editData.apellido}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={editData.fechaNacimiento}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label>Género</label>
                  <select
                    name="genero"
                    value={editData.genero}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Sin Especificar">Sin Especificar</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Número de Teléfono</label>
                <input
                  type="tel"
                  name="numeroTelefonico"
                  value={editData.numeroTelefonico}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          ) : (
            <div className="perfil-info">
              <div className="info-grid">
                <div className="info-item">
                  <label>Nombre Completo</label>
                  <p>{profileData.nombre} {profileData.apellido}</p>
                </div>
                
                <div className="info-item">
                  <label>Correo Electrónico</label>
                  <p>{profileData.correo}</p>
                </div>
                
                <div className="info-item">
                  <label>Fecha de Nacimiento</label>
                  <p>{formatDate(profileData.fechaNacimiento)}</p>
                </div>
                
                <div className="info-item">
                  <label>Edad</label>
                  <p>{calculateAge(profileData.fechaNacimiento)}</p>
                </div>
                
                <div className="info-item">
                  <label>Género</label>
                  <p>{profileData.genero || "No especificado"}</p>
                </div>
                
                <div className="info-item">
                  <label>Teléfono</label>
                  <p>{profileData.numeroTelefonico || "No especificado"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información de cuenta */}
        <div className="perfil-section">
          <h2>Información de la Cuenta</h2>
          <div className="account-info">
            <div className="info-item">
              <label>Fecha de Registro</label>
              <p>{formatDate(profileData.createdAt)}</p>
            </div>
            
            <div className="info-item">
              <label>Última Actualización</label>
              <p>{formatDate(profileData.updatedAt)}</p>
            </div>
            
            <div className="info-item">
              <label>ID de Usuario</label>
              <p className="user-id">{profileData.id}</p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="message success">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;