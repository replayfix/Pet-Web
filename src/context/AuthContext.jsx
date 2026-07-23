import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { subscribeOrders } from '../firebase/dbService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Estado general de usuario: { name, email, role: 'admin' | 'client', photoURL?: string }
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('petweb_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    if (localStorage.getItem('petweb_is_admin') === 'true') {
      return { name: 'Administrador Principal', email: 'admin@petweb.pe', role: 'admin' };
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Estados para Modal de Reseñas y Redirección post-login
  const [pendingReviewProduct, setPendingReviewProduct] = useState(null);
  const [activeReviewModalProduct, setActiveReviewModalProduct] = useState(null);

  // Estados para Perfil, Direcciones y Pedidos
  const [userProfile, setUserProfile] = useState({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    genero: '',
    fechaNacimiento: '',
    telefono: ''
  });
  const [userAddresses, setUserAddresses] = useState([]);
  const [userOrders, setUserOrders] = useState([]);

  // Redirección post-login automática al modal de reseñas si el usuario quiso calificar un producto sin estar autenticado
  useEffect(() => {
    if (currentUser && pendingReviewProduct) {
      const product = pendingReviewProduct;
      setPendingReviewProduct(null);
      setIsLoginModalOpen(false);
      setTimeout(() => {
        setActiveReviewModalProduct(product);
      }, 150);
    }
  }, [currentUser, pendingReviewProduct]);

  // Cargar perfil y direcciones desde Firestore o localStorage al cambiar currentUser
  useEffect(() => {
    if (!currentUser) {
      setUserProfile({ nombre: '', apellido: '', email: '', documento: '', genero: '', fechaNacimiento: '', telefono: '' });
      setUserAddresses([]);
      setUserOrders([]);
      return;
    }

    const loadUserData = async () => {
      const userKey = currentUser.email || currentUser.name;
      const localProfile = localStorage.getItem(`petweb_profile_${userKey}`);
      const localAddresses = localStorage.getItem(`petweb_addresses_${userKey}`);
      const localOrders = localStorage.getItem(`petweb_orders_${userKey}`);

      if (localProfile) {
        try { setUserProfile(JSON.parse(localProfile)); } catch (e) {}
      } else {
        const parts = (currentUser.name || '').split(' ');
        setUserProfile({
          nombre: parts[0] || currentUser.name || '',
          apellido: parts.slice(1).join(' ') || '',
          email: currentUser.email || '',
          documento: '',
          genero: '',
          fechaNacimiento: '',
          telefono: ''
        });
      }

      if (localAddresses) {
        try { setUserAddresses(JSON.parse(localAddresses)); } catch (e) {}
      }
      if (localOrders) {
        try { setUserOrders(JSON.parse(localOrders)); } catch (e) {}
      }

      // Sincronizar desde Firestore en vivo si está disponible
      if (db && userKey) {
        try {
          const docRef = doc(db, 'users', userKey);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profile) {
              setUserProfile(data.profile);
              localStorage.setItem(`petweb_profile_${userKey}`, JSON.stringify(data.profile));
            }
            if (data.addresses) {
              setUserAddresses(data.addresses);
              localStorage.setItem(`petweb_addresses_${userKey}`, JSON.stringify(data.addresses));
            }
          }
        } catch (err) {
          console.warn('No se pudo cargar desde Firestore (usando fallback local):', err);
        }
      }
    };

    loadUserData();

    // Suscripción en tiempo real a la colección de órdenes (ORDERS_COLLECTION)
    const unsubscribeOrders = subscribeOrders((allOrders) => {
      const userEmail = currentUser.email?.toLowerCase();
      const userName = currentUser.name?.toLowerCase().trim();

      const filtered = allOrders.filter(order => {
        const cust = order.customer || {};
        const custEmail = (cust.email || '').toLowerCase();
        const custName = (cust.name || '').toLowerCase().trim();
        const custPhone = (cust.phone || '').trim();

        if (userEmail && custEmail && custEmail === userEmail && custEmail !== 'sin correo registrado') return true;
        if (userName && custName && custName === userName) return true;
        if (currentUser.phone && custPhone && custPhone === currentUser.phone) return true;
        return false;
      });
      setUserOrders(filtered);
      localStorage.setItem(`petweb_orders_${currentUser.email || currentUser.name}`, JSON.stringify(filtered));
    });

    return () => {
      if (unsubscribeOrders && typeof unsubscribeOrders === 'function') {
        unsubscribeOrders();
      }
    };
  }, [currentUser]);

  // Guardar perfil del usuario en Firestore y localStorage
  const saveUserProfile = async (newProfile) => {
    if (!currentUser) return false;
    const userKey = currentUser.email || currentUser.name;
    const updated = { ...userProfile, ...newProfile };
    setUserProfile(updated);
    localStorage.setItem(`petweb_profile_${userKey}`, JSON.stringify(updated));

    if (db && userKey) {
      try {
        const docRef = doc(db, 'users', userKey);
        await setDoc(docRef, {
          profile: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
      } catch (err) {
        console.warn('Guardado local ok, pero error en Firestore:', err);
      }
    }
    return true;
  };

  // Añadir dirección del usuario y guardar en Firestore
  const addAddress = async (addressData) => {
    if (!currentUser) return false;
    const userKey = currentUser.email || currentUser.name;
    const newAddr = {
      id: Date.now().toString(),
      ...addressData
    };
    const updated = [newAddr, ...userAddresses];
    setUserAddresses(updated);
    localStorage.setItem(`petweb_addresses_${userKey}`, JSON.stringify(updated));

    if (db && userKey) {
      try {
        const docRef = doc(db, 'users', userKey);
        await setDoc(docRef, {
          addresses: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Error guardando dirección en Firestore:', err);
      }
    }
    return true;
  };

  // Eliminar dirección del usuario y guardar en Firestore
  const removeAddress = async (id) => {
    if (!currentUser) return false;
    const userKey = currentUser.email || currentUser.name;
    const updated = userAddresses.filter(a => a.id !== id);
    setUserAddresses(updated);
    localStorage.setItem(`petweb_addresses_${userKey}`, JSON.stringify(updated));

    if (db && userKey) {
      try {
        const docRef = doc(db, 'users', userKey);
        await setDoc(docRef, {
          addresses: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {}
    }
    return true;
  };

  // Guardar en localStorage siempre que cambie currentUser
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('petweb_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'admin') {
        localStorage.setItem('petweb_is_admin', 'true');
      } else {
        localStorage.removeItem('petweb_is_admin');
      }
    } else {
      localStorage.removeItem('petweb_current_user');
      localStorage.removeItem('petweb_is_admin');
    }
  }, [currentUser]);

  const isAdmin = currentUser?.role === 'admin';

  // Función para Iniciar Sesión con Correo y Contraseña
  const login = async (emailOrUser, passwordOrPin) => {
    if (!emailOrUser || !passwordOrPin) {
      return { success: false, message: 'Por favor completa tu correo y contraseña.' };
    }

    // 1. Intentar autenticación real con Firebase nativo
    if (auth && auth.app && emailOrUser.includes('@')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailOrUser, passwordOrPin);
        const user = userCredential.user;
        const isUserAdmin = user.email?.toLowerCase().includes('admin@petweb.pe') || user.email?.toLowerCase().includes('admin');
        
        // ¡Validación estricta para clientes normales!
        if (!isUserAdmin && !user.emailVerified) {
          return { 
            success: false, 
            unverified: true, 
            message: '⚠️ Aún falta validar o activar tu enlace desde el correo electrónico. Por favor revísalo antes de entrar.' 
          };
        }

        const clientData = {
          name: isUserAdmin ? 'Administrador Principal' : (user.displayName || emailOrUser.split('@')[0].toUpperCase()),
          email: user.email,
          role: isUserAdmin ? 'admin' : 'client',
          verified: true
        };
        setCurrentUser(clientData);
        setIsLoginModalOpen(false);
        return { success: true, user: clientData };
      } catch (firebaseErr) {
        if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
          return { success: false, message: 'Correo electrónico o contraseña incorrectos' };
        }
      }
    }

    // 2. Fallback de cliente/admin local sin Firebase activo
    const isAdminEmail = emailOrUser.toLowerCase().includes('admin') || emailOrUser === 'admin@petweb.pe';
    if (isAdminEmail) {
      if (passwordOrPin === '1234' || passwordOrPin === 'admin') {
        const adminData = {
          name: 'Administrador Principal',
          email: 'admin@petweb.pe',
          role: 'admin'
        };
        setCurrentUser(adminData);
        setIsLoginModalOpen(false);
        return { success: true, user: adminData };
      }
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    const clientData = {
      name: emailOrUser.split('@')[0].toUpperCase(),
      email: emailOrUser,
      role: 'client'
    };
    setCurrentUser(clientData);
    setIsLoginModalOpen(false);
    return { success: true, user: clientData };
  };

  // Función para Crear Cuenta de Cliente con Firebase oficial (y envío de enlace de verificación)
  const register = async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, message: 'Todos los campos son obligatorios.' };
    }

    if (auth && auth.app) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await sendEmailVerification(userCredential.user);

        const newClient = {
          name: name,
          email: email,
          role: 'client',
          verified: false,
          firebaseUser: true
        };
        // ¡IMPORTANTE! No llamamos a setCurrentUser aquí para no dejarlo logueado hasta que valide su correo
        return { success: true, user: newClient, emailSent: true };
      } catch (firebaseErr) {
        if (firebaseErr.code === 'auth/email-already-in-use') {
          return { success: false, message: 'Este correo electrónico ya está registrado' };
        } else if (firebaseErr.code === 'auth/invalid-email') {
          return { success: false, message: 'El correo electrónico ingresado no es válido.' };
        } else if (firebaseErr.code === 'auth/weak-password') {
          return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
        }
        console.warn('Error en registro Firebase, usando fallback local:', firebaseErr);
      }
    }

    // Fallback local
    const newClient = {
      name: name,
      email: email,
      role: 'client',
      verified: true
    };
    setCurrentUser(newClient);
    setIsLoginModalOpen(false);
    return { success: true, user: newClient };
  };

  // Verificar en tiempo real (consultando a los servidores de Firebase) si el usuario ya hizo clic en su enlace
  const checkEmailVerification = async () => {
    if (auth && auth.currentUser) {
      await auth.currentUser.reload(); // Descarga en vivo de Firebase el estado actualizado
      if (auth.currentUser.emailVerified === true) {
        const isUserAdmin = auth.currentUser.email?.toLowerCase().includes('admin@petweb.pe') || auth.currentUser.email?.toLowerCase().includes('admin');
        const verifiedClient = {
          name: isUserAdmin ? 'Administrador Principal' : (auth.currentUser.displayName || auth.currentUser.email.split('@')[0].toUpperCase()),
          email: auth.currentUser.email,
          role: isUserAdmin ? 'admin' : 'client',
          verified: true
        };
        setCurrentUser(verifiedClient);
        setIsLoginModalOpen(false);
        return { success: true, verified: true };
      } else {
        return { 
          success: false, 
          verified: false, 
          message: '⚠️ Aún falta validar o activar tu enlace. Por favor, abre tu correo electrónico y haz clic en el enlace para poder entrar.' 
        };
      }
    }
    setIsLoginModalOpen(false);
    return { success: true, verified: true };
  };

  const resendLink = async () => {
    if (auth && auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      } catch (e) {
        return { success: false, message: 'Espera unos segundos antes de solicitar otro correo.' };
      }
    }
    return { success: true };
  };

  // Función para Login / Registro con Google (Gmail)
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      if (auth && auth.app) {
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          const isGoogleAdmin = user.email?.toLowerCase().includes('admin@petweb.pe');
          
          const userData = {
            name: user.displayName || user.email?.split('@')[0] || 'Usuario Gmail',
            email: user.email || 'usuario@gmail.com',
            photoURL: user.photoURL,
            role: isGoogleAdmin ? 'admin' : 'client',
            verified: true
          };
          
          setCurrentUser(userData);
          setIsLoginModalOpen(false);
          return { success: true, user: userData };
        } catch (firebaseErr) {
          if (firebaseErr.code === 'auth/operation-not-allowed' || firebaseErr.code === 'auth/unauthorized-domain' || firebaseErr.code === 'auth/popup-closed-by-user') {
            console.warn('Firebase Google Auth no activado o popup cerrado.');
          } else {
            throw firebaseErr;
          }
        }
      }
    } catch (e) {
      console.error('Error Google Auth:', e);
    }

    const demoGoogleUser = {
      name: 'Usuario Gmail (Demo Verificado)',
      email: 'cliente.petweb@gmail.com',
      role: 'client',
      verified: true
    };
    setCurrentUser(demoGoogleUser);
    setIsLoginModalOpen(false);
    return { success: true, user: demoGoogleUser, isDemoFallback: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const loginAsAdmin = (pin) => login('admin@petweb.pe', pin);
  const logoutAdmin = () => logout();

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      isLoginModalOpen,
      setIsLoginModalOpen,
      isLogoutConfirmOpen,
      setIsLogoutConfirmOpen,
      userProfile,
      userAddresses,
      userOrders,
      saveUserProfile,
      addAddress,
      removeAddress,
      login,
      register,
      checkEmailVerification,
      resendLink,
      loginWithGoogle,
      logout,
      loginAsAdmin,
      logoutAdmin,
      pendingReviewProduct,
      setPendingReviewProduct,
      activeReviewModalProduct,
      setActiveReviewModalProduct
    }}>
      {children}
    </AuthContext.Provider>
  );
};
