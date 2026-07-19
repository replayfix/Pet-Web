import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  MailCheck, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw 
} from 'lucide-react';

export default function AuthModal() {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    login, 
    register, 
    checkEmailVerification, 
    resendLink, 
    loginWithGoogle 
  } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'verify_code'
  
  // Campos Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Campos Registro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Campos de Activación por Código o Enlace
  const [generatedCode, setGeneratedCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [firebaseLinkSent, setFirebaseLinkSent] = useState(false);

  const [error, setError] = useState('');

  const handleClose = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setError('');
    setIsLoginModalOpen(false);
  };

  const handleSwitchTab = (newTab) => {
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setError('');
    setTab(newTab);
  };

  useEffect(() => {
    if (!isLoginModalOpen) {
      setLoginEmail('');
      setLoginPassword('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setError('');
      setTab('login');
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      setLoginEmail('');
      setLoginPassword('');
    } else if (result.unverified) {
      setRegEmail(result.email || loginEmail);
      setTab('verify_code');
      setError(result.message);
    } else {
      setError(result.message);
    }
  };

  // Paso 1 de registro: Crear en Firebase oficial (envía LINK de verificación) y generar código local de 6 dígitos
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Por favor completa todos los campos para crear tu cuenta.');
      return;
    }

    if (regPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Intentamos registrar al usuario de verdad en Firebase para que le llegue el ENLACE oficial al correo
    const result = await register(regName, regEmail, regPassword);
    if (result.success) {
      if (result.emailSent) {
        setFirebaseLinkSent(true);
      }
      setVerificationCode('');
      setTab('verify_code');
    } else {
      setError(result?.message || 'Error al registrar usuario.');
    }
  };

  // Paso 2 de registro: Confirmar que ya activó su enlace web en el correo consultando a Firebase
  const handleVerifyLinkSuccess = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await checkEmailVerification();
    if (result.verified) {
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setIsLoginModalOpen(false);
    } else {
      setError(result?.message || 'Aún no detectamos la activación.');
    }
  };

  const handleResendLink = async () => {
    setIsResending(true);
    await resendLink();
    setTimeout(() => {
      setIsResending(false);
      setError('');
      alert(`¡Hemos reenviado el enlace de verificación a ${regEmail}! Revisa tu bandeja o carpeta de spam.`);
    }, 800);
  };

  const handleGoogleClick = async () => {
    setError('');
    await loginWithGoogle();
  };


  return (
    <div className="modal-overlay animate-fade-in z-50" onClick={handleClose}>
      <div className="modal-content max-w-md w-full p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera del Modal con Pestañas y Botón Cerrar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
          {tab === 'verify_code' ? (
            <div className="flex items-center gap-2 text-primary font-extrabold text-sm">
              <MailCheck size={20} />
              <span>Verificación de Cuenta</span>
            </div>
          ) : (
            <div className="flex gap-6">
              <button 
                type="button"
                onClick={() => handleSwitchTab('login')}
                className={`pb-2 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  tab === 'login' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </button>

              <button 
                type="button"
                onClick={() => handleSwitchTab('register')}
                className={`pb-2 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  tab === 'register' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserPlus size={18} />
                <span>Crear Cuenta</span>
              </button>
            </div>
          )}

          <button 
            type="button"
            onClick={handleClose}
            title="Cerrar ventana"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PESTAÑA 1: INICIAR SESIÓN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="form-group mb-4">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-3">
                Correo electrónico o usuario
              </label>
              <div className="auth-input-pill">
                <input 
                  type="text"
                  placeholder="Ingrese su correo"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="auth-input-field"
                />
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-3">
                Contraseña
              </label>
              <div className="auth-input-pill justify-between">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="auth-input-field"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="text-slate-400 hover:text-slate-600 p-1 shrink-0 cursor-pointer ml-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="btn btn-primary w-full py-3.5 rounded-full text-sm font-extrabold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-3 cursor-pointer transition-transform active:scale-95"
            >
              <LogIn size={18} />
              <span>Entrar a mi Cuenta</span>
            </button>

            {/* SEPARADOR O CONTINUAR CON GOOGLE */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                O ingresa con
              </span>
            </div>

            {/* BOTÓN CONTINUAR CON GOOGLE (@GMAIL.COM) */}
            <button 
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-sm rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z" />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </form>
        )}

        {/* PESTAÑA 2: CREAR CUENTA */}
        {tab === 'register' && (
          <form onSubmit={handleInitiateRegister} className="space-y-4">
            <div className="form-group mb-4">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-3">
                Nombre Completo
              </label>
              <div className="auth-input-pill">
                <input 
                  type="text"
                  placeholder="Ingresar nombre completo"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="auth-input-field"
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-3">
                Correo Electrónico (@gmail, @hotmail, etc.)
              </label>
              <div className="auth-input-pill">
                <input 
                  type="email"
                  placeholder="Ingresar Correo"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="auth-input-field"
                />
              </div>
            </div>

            <div className="form-group mb-5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-3">
                Contraseña
              </label>
              <div className="auth-input-pill justify-between">
                <input 
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña (mínimo 6 caracteres)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="auth-input-field"
                />
                <button 
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  title={showRegPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="text-slate-400 hover:text-slate-600 p-1 shrink-0 cursor-pointer ml-1"
                >
                  {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="btn btn-primary w-full py-3.5 rounded-full text-sm font-extrabold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-3 cursor-pointer transition-transform active:scale-95"
            >
              <MailCheck size={18} />
              <span>Continuar y Recibir Código / Enlace</span>
            </button>
          </form>
        )}

        {/* PESTAÑA 3: VERIFICACIÓN DEL CÓDIGO O ENLACE */}
        {/* PESTAÑA 3: VERIFICACIÓN POR ENLACE DE FIREBASE */}
        {tab === 'verify_code' && (
          <form onSubmit={handleVerifyLinkSuccess} className="space-y-6 animate-fade-in py-2">
            <div className="text-center py-3">
              <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <MailCheck size={42} className="animate-bounce" />
              </div>
              <h4 className="font-extrabold text-xl text-slate-900 mb-2">
                ¡Enlace enviado a tu correo!
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Hemos registrado tu cuenta en Firebase y te enviamos un <strong className="text-primary underline">enlace de activación oficial</strong> a <strong className="text-slate-800">{regEmail}</strong>. Por favor revisa tu bandeja de entrada o carpeta de spam y haz clic en el enlace.
              </p>
            </div>

            <button 
              type="submit"
              className="btn btn-primary w-full py-4 rounded-full text-sm font-extrabold shadow-xl shadow-primary/25 flex items-center justify-center gap-2.5 cursor-pointer transition-transform active:scale-95"
            >
              <CheckCircle2 size={20} />
              <span>Ya activé mi enlace / Entrar</span>
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Cambiar correo</span>
              </button>

              <button
                type="button"
                onClick={handleResendLink}
                disabled={isResending}
                className="text-primary hover:text-primary-dark font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isResending ? "animate-spin" : ""} />
                <span>{isResending ? "Reenviando..." : "Reenviar enlace"}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
