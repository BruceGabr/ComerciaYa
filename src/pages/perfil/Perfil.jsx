import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { scrollToTop } from "../../components/scrollToTop/ScrollToTop";
import "./Perfil.css";

function Perfil() {
  const { user, getUserProfile, updateUserProfile } = useAuth();
  
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

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    loadProfile();
    scrollToTop();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const profile = await getUserProfile();
      setProfileData(profile);
      
      // Preparar datos para edición
      setEditData({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        fechaNacimiento: profile.fechaNacimiento ? profile.fechaNacimiento.split('T')[0] : "",
        genero: profile.genero || "",
        numeroTelefonico: profile.numeroTelefonico || ""
      });
      
      console.log("Perfil cargado:", profile);
    } catch (err) {
      console.error("Error cargando perfil:", err);
      setError("Error al cargar el perfil. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
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
    setEditData({
      nombre: profileData.nombre || "",
      apellido: profileData.apellido || "",
      fechaNacimiento: profileData.fechaNacimiento ? profileData.fechaNacimiento.split('T')[0] : "",
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

      // Validar edad mínima
      const birthDate = new Date(editData.fechaNacimiento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 17 || (age === 17 && monthDiff < 0)) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "No especificado";
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };

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

  if (!profileData) {
    return (
      <div className="perfil-container">
        <div className="perfil-error">
          <h3>Error al cargar el perfil</h3>
          <p>{error || "No se pudo cargar la información del usuario."}</p>
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