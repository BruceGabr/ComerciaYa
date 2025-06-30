import React, { useState, useCallback, useMemo, useEffect } from "react";
import { scrollToTop } from "../../components/scrollToTop/ScrollToTop";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bgRegistro from "../../assets/images/bg-registro2.webp";
import axios from "axios";
import "./Registro.css";


// Hooks personalizados
const useFormData = (initialData) => {
  const [data, setData] = useState(initialData);

  const updateField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateNestedField = useCallback((parentField, childField, value) => {
    setData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  }, []);

  return [data, updateField, updateNestedField, setData];
};

const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateStep1 = useCallback((data) => {
    const newErrors = {};

    if (!data.correo) newErrors.correo = "El correo es requerido";
    else if (!/\S+@\S+\.\S+/.test(data.correo)) newErrors.correo = "Correo inválido";

    if (!data.contrasena) newErrors.contrasena = "La contraseña es requerida";
    else if (data.contrasena.length < 6) newErrors.contrasena = "Mínimo 6 caracteres";

    if (data.contrasena !== data.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateStep2 = useCallback((data) => {
    const newErrors = {};

    if (!data.nombre) newErrors.nombre = "El nombre es requerido";
    if (!data.apellido) newErrors.apellido = "El apellido es requerido";
    if (!data.fechaNacimiento.dia || !data.fechaNacimiento.mes || !data.fechaNacimiento.año) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
    } else {
      // Mapear meses de texto a números
      const monthMap = {
        "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
        "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12
      };

      // Validar edad mínima de 17 años
      const currentDate = new Date();
      const birthDate = new Date(
        parseInt(data.fechaNacimiento.año),
        monthMap[data.fechaNacimiento.mes] - 1, // Los meses en JS van de 0-11
        parseInt(data.fechaNacimiento.dia)
      );

      const age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = currentDate.getMonth() - birthDate.getMonth();
      const dayDiff = currentDate.getDate() - birthDate.getDate();

      // Calcular edad exacta
      let exactAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        exactAge--;
      }

      if (exactAge < 17) {
        newErrors.fechaNacimiento = "Debes tener al menos 17 años para registrarte";
      }
    }
    if (!data.genero) newErrors.genero = "Selecciona un género";
    if (!data.contacto) newErrors.contacto = "El número de contacto es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validateStep1, validateStep2, clearErrors };
};

// Componentes de cada paso
const Step1 = ({ formData, onFieldChange, errors }) => {
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: "" };
    if (password.length < 6) return { strength: 1, text: "Débil" };
    if (password.length < 10) return { strength: 2, text: "Media" };
    return { strength: 3, text: "Fuerte" };
  };

  const passwordStrength = getPasswordStrength(formData.contrasena);

  return (
    <div className="step-content">
      <h3>Credenciales de Acceso</h3>
      <p>Configura tu email y contraseña para acceder a tu cuenta</p>

      <div className="form-group">
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={(e) => onFieldChange('correo', e.target.value)}
          className={errors.correo ? 'error' : ''}
          required
        />
        {errors.correo && <span className="error-message">{errors.correo}</span>}
      </div>

      <div className="form-group">
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={(e) => onFieldChange('contrasena', e.target.value)}
          className={errors.contrasena ? 'error' : ''}
          required
        />
        {formData.contrasena && (
          <div className={`password-strength strength-${passwordStrength.strength}`}>
            <div className="strength-bar">
              <div className="strength-fill"></div>
            </div>
            <span className="strength-text">{passwordStrength.text}</span>
          </div>
        )}
        {errors.contrasena && <span className="error-message">{errors.contrasena}</span>}
      </div>

      <div className="form-group">
        <input
          type="password"
          name="confirmarContrasena"
          placeholder="Confirmar contraseña"
          value={formData.confirmarContrasena}
          onChange={(e) => onFieldChange('confirmarContrasena', e.target.value)}
          className={errors.confirmarContrasena ? 'error' : ''}
          required
        />
        {errors.confirmarContrasena && <span className="error-message">{errors.confirmarContrasena}</span>}
      </div>

      <div className="checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" required />
          <span className="checkmark"></span>
          Acepto los términos y condiciones
        </label>
      </div>
    </div>
  );
};

const Step2 = ({ formData, onFieldChange, onNestedFieldChange, errors }) => {
  const meses = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic"
  ];

  // Limitar años para mínimo 17 años de edad
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 17; // Año máximo para tener al menos 17 años
  const minYear = currentYear - 100; // Límite inferior razonable
  const años = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  return (
    <div className="step-content">
      <h3>Información Personal</h3>
      <p>Cuéntanos un poco sobre ti</p>

      <div className="form-row">
        <div className="form-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => onFieldChange('nombre', e.target.value)}
            className={errors.nombre ? 'error' : ''}
            required
          />
          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={(e) => onFieldChange('apellido', e.target.value)}
            className={errors.apellido ? 'error' : ''}
            required
          />
          {errors.apellido && <span className="error-message">{errors.apellido}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Fecha de nacimiento:</label>
        <div className="fecha-group">
          <select
            name="dia"
            value={formData.fechaNacimiento.dia}
            onChange={(e) => onNestedFieldChange('fechaNacimiento', 'dia', e.target.value)}
            className={errors.fechaNacimiento ? 'error' : ''}
            required
          >
            <option value="">Día</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                {i + 1}
              </option>
            ))}
          </select>

          <select
            name="mes"
            value={formData.fechaNacimiento.mes}
            onChange={(e) => onNestedFieldChange('fechaNacimiento', 'mes', e.target.value)}
            className={errors.fechaNacimiento ? 'error' : ''}
            required
          >
            <option value="">Mes</option>
            {meses.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            name="año"
            value={formData.fechaNacimiento.año}
            onChange={(e) => onNestedFieldChange('fechaNacimiento', 'año', e.target.value)}
            className={errors.fechaNacimiento ? 'error' : ''}
            required
          >
            <option value="">Año</option>
            {años.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
        {errors.fechaNacimiento && <span className="error-message">{errors.fechaNacimiento}</span>}
      </div>

      <div className="form-group">
        <label>Género:</label>
        <div className="genero-group">
          {["Mujer", "Hombre", "Sin Especificar"].map((g) => (
            <label key={g} className="radio-label">
              <input
                type="radio"
                name="genero"
                value={g}
                onChange={(e) => onFieldChange('genero', e.target.value)}
                checked={formData.genero === g}
                required
              />
              <span className="radio-checkmark"></span>
              {g}
            </label>
          ))}
        </div>
        {errors.genero && <span className="error-message">{errors.genero}</span>}
      </div>

      <div className="form-group">
        <input
          type="tel"
          name="contacto"
          placeholder="Número de contacto"
          value={formData.contacto}
          onChange={(e) => onFieldChange('contacto', e.target.value)}
          className={errors.contacto ? 'error' : ''}
          required
        />
        {errors.contacto && <span className="error-message">{errors.contacto}</span>}
      </div>
    </div>
  );
};

const Step3 = ({ formData }) => {
  return (
    <div className="step-content">
      <h3>Confirma tu Información</h3>
      <p>Revisa que todos los datos sean correctos</p>

      <div className="summary-card">
        <div className="summary-section">
          <h4>Credenciales</h4>
          <p><strong>Email:</strong> {formData.correo}</p>
        </div>

        <div className="summary-section">
          <h4>Información Personal</h4>
          <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</p>
          <p><strong>Fecha de nacimiento:</strong> {formData.fechaNacimiento.dia}/{formData.fechaNacimiento.mes}/{formData.fechaNacimiento.año}</p>
          <p><strong>Género:</strong> {formData.genero}</p>
          <p><strong>Contacto:</strong> {formData.contacto}</p>
        </div>
      </div>

      <div className="final-message">
        <p>Al registrarte, podrás acceder a todas las funcionalidades de nuestra plataforma.</p>
      </div>
    </div>
  );
};

// Componente principal
function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  const initialFormData = {
    nombre: "",
    apellido: "",
    fechaNacimiento: { dia: "", mes: "", año: "" },
    genero: "",
    contacto: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  };

  const [formData, updateField, updateNestedField] = useFormData(initialFormData);
  const { errors, validateStep1, validateStep2, clearErrors } = useFormValidation();

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Precargar imagen de fondo
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => console.error('Error cargando imagen de fondo');
    img.src = bgRegistro;
  }, []);

  const handleNext = useCallback(() => {
    clearErrors();

    if (currentStep === 1 && !validateStep1(formData)) return;
    if (currentStep === 2 && !validateStep2(formData)) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      scrollToTop();
    }
  }, [currentStep, formData, validateStep1, validateStep2, clearErrors, totalSteps]);

  const handlePrevious = useCallback(() => {
    clearErrors();
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  }, [currentStep, clearErrors]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setMensaje("Procesando registro...");

    const monthMap = {
      "ene": "01", "feb": "02", "mar": "03", "abr": "04", "may": "05", "jun": "06",
      "jul": "07", "ago": "08", "sep": "09", "oct": "10", "nov": "11", "dic": "12"
    };

    const dataToSend = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      fechaNacimiento: {
        dia: formData.fechaNacimiento.dia,
        mes: monthMap[formData.fechaNacimiento.mes],
        año: formData.fechaNacimiento.año,
      },
      genero: formData.genero,
      contacto: formData.contacto,
      correo: formData.correo,
      contrasena: formData.contrasena,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/register", dataToSend);

      if (response.status === 201) {
        setMensaje("¡Registro exitoso! Redirigiendo...");
        setTimeout(() => {
          login();
          navigate("/miemprendimiento");
        }, 1500);
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error.response?.data || error.message);
      if (error.response?.status === 409) {
        setMensaje(error.response.data.message);
      } else {
        setMensaje("Error al registrar el usuario. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, login, navigate]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <Step1 formData={formData} onFieldChange={updateField} errors={errors} />;
      case 2:
        return <Step2
          formData={formData}
          onFieldChange={updateField}
          onNestedFieldChange={updateNestedField}
          errors={errors}
        />;
      case 3:
        return <Step3 formData={formData} />;
      default:
        return null;
    }
  }, [currentStep, formData, updateField, updateNestedField, errors]);

  return (
    <div 
      className="registro-container"
      style={{
        backgroundImage: imageLoaded ? `url(${bgRegistro})` : 'none',
        backgroundColor: imageLoaded ? 'transparent' : 'var(--background-light, #f5f6f7)'
      }}
    >
      <div className="registro-box">
        <h2>Crea tu cuenta</h2>
        <p>Paso {currentStep} de {totalSteps}</p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="registro-form">
          {renderStep}

          <div className="button-group">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Anterior
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </button>
            )}
          </div>
        </div>

        {mensaje && (
          <div className={`message ${mensaje.includes("exitoso") ? "success" : "error"}`}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}

export default Registro;