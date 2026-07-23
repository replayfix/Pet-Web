import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch, 
  query, 
  orderBy, 
  getDocs,
  serverTimestamp,
  runTransaction,
  getDoc
} from "firebase/firestore";
import { db } from "./config";

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";

// Suscribirse a los productos en tiempo real para la Tienda y el Control de Almacén
export const subscribeProducts = (callback, errorCallback) => {
  const q = query(collection(db, PRODUCTS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(products);
  }, (err) => {
    console.error("Error al escuchar productos en Firestore:", err);
    if (errorCallback) errorCallback(err);
  });
};

// Obtener productos una sola vez (si es necesario)
export const getProducts = async () => {
  const q = query(collection(db, PRODUCTS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Suscribirse a las órdenes de compra en tiempo real
export const subscribeOrders = (callback, errorCallback) => {
  const q = query(collection(db, ORDERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      let timestamp = Date.now();
      if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
        timestamp = data.createdAt.toMillis();
      } else if (data.createdAt && data.createdAt.seconds) {
        timestamp = data.createdAt.seconds * 1000;
      }
      return {
        id: doc.id,
        ...data,
        timestamp
      };
    });
    // Ordenar de más reciente a más antiguo en memoria
    orders.sort((a, b) => b.timestamp - a.timestamp);

    // Asignar el número de boleta dinámicamente (la más antigua es B001, la siguiente B002, etc.)
    orders.forEach((order, index) => {
      const sequentialRank = orders.length - index;
      const prefix = `B${String(sequentialRank).padStart(3, '0')}`;
      const suffix = order.id ? order.id.slice(-6).toUpperCase() : '053514';
      order.boletaNumber = `${prefix}-${suffix}`;
    });

    callback(orders);
  }, (err) => {
    console.error("Error al escuchar órdenes en Firestore:", err);
    if (errorCallback) errorCallback(err);
  });
};

// Eliminar una orden de compra (sin restaurar stock)
export const deleteOrder = async (orderId) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    throw error;
  }
};

// Eliminar una orden y RESTAURAR automáticamente los ítems al inventario si ya se había descontado stock
export const deleteOrderAndRestoreStock = async (order) => {
  try {
    const isDeducted = Boolean(order.stockDeducted || (order.status === 'completed' && typeof order.stockDeducted === 'undefined') || order.paymentStatus === 'Pago' || order.paymentStatus === 'Pagado');
    if (isDeducted && order.items && Array.isArray(order.items)) {
      const currentProducts = await getProducts();
      for (const item of order.items) {
        if (item.id) {
          const prod = currentProducts.find(p => p.id === item.id);
          if (prod) {
            const currentStock = Number(prod.stock || 0);
            await adjustStock(item.id, currentStock, Number(item.quantity || 1));
          }
        }
      }
    }
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar orden y restaurar stock:", error);
    throw error;
  }
};

// Agregar un nuevo producto al almacén
export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      stock: Number(productData.stock) || 0,
      minStock: Number(productData.minStock) || 5,
      price: Number(productData.price) || 0,
      createdAt: serverTimestamp(),
      status: "active"
    });
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error al agregar producto:", error);
    throw error;
  }
};

// Editar un producto existente
export const updateProduct = async (productId, productData) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      ...productData,
      stock: Number(productData.stock),
      minStock: Number(productData.minStock),
      price: Number(productData.price),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

// Eliminar un producto del inventario
export const deleteProduct = async (productId) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};

// Ajuste rápido de stock (+ / - delta)
export const adjustStock = async (productId, currentStock, delta) => {
  try {
    const newStock = Math.max(0, Number(currentStock) + Number(delta));
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: serverTimestamp()
    });
    return newStock;
  } catch (error) {
    console.error("Error al ajustar stock:", error);
    throw error;
  }
};

// Crear un pedido (se guarda en estado Pendiente y NO descuenta stock del almacén)
export const createOrder = async (customerInfo, cartItems, totalAmount) => {
  try {
    const batch = writeBatch(db);
    
    // 1. Crear documento en la colección de pedidos en estado 'Pendiente'
    const orderRef = doc(collection(db, ORDERS_COLLECTION));
    batch.set(orderRef, {
      customer: customerInfo,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      })),
      total: totalAmount,
      status: "Pendiente",
      paymentStatus: customerInfo.paymentStatus || "Pendiente de pago",
      stockDeducted: false,
      createdAt: serverTimestamp()
    });

    // 2. NO se descuenta stock aquí para evitar que pedidos falsos o no confirmados vacíen el inventario.
    // El inventario solo se resta cuando el Administrador confirma o marca el pedido como Pagado.

    await batch.commit();
    return orderRef.id;
  } catch (error) {
    console.error("Error al procesar orden:", error);
    throw error;
  }
};

// Actualizar el estado de pago de una boleta/orden en Firestore y descontar stock si corresponde
export const updateOrderPaymentStatus = async (orderId, newStatus, orderObject = null) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    const isConfirmingPayment = newStatus === 'Pago' || newStatus === 'Pagado' || newStatus === 'Confirmado';
    
    let alreadyDeducted = orderObject?.stockDeducted || false;
    if (orderObject === null || typeof orderObject.stockDeducted === 'undefined') {
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        alreadyDeducted = Boolean(orderData.stockDeducted || (orderData.status === 'completed' && typeof orderData.stockDeducted === 'undefined') || orderData.paymentStatus === 'Pago' || orderData.paymentStatus === 'Pagado');
      }
    }

    if (isConfirmingPayment && !alreadyDeducted) {
      // Validar stock disponible y descontar en transacción asegurando TODAS LAS LECTURAS antes de cualquier escritura
      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error("El pedido no existe en la base de datos.");
        
        const orderData = orderSnap.data();
        if (orderData.stockDeducted) {
          transaction.update(orderRef, { paymentStatus: newStatus, status: "Confirmado", updatedAt: serverTimestamp() });
          return;
        }

        const items = orderData.items || [];
        
        // 1. LECTURAS (GET): Obtener todos los snapshots de productos en memoria PRIMERO
        const productDataMap = [];
        for (const item of items) {
          if (!item.id) continue;
          const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) {
            throw new Error(`INSUFFICIENT_STOCK:${item.name}|Disponibles: 0 unds|Requeridos: ${item.quantity} unds (Producto ya no existe)`);
          }
          const productData = productSnap.data();
          const currentStock = Number(productData.stock || 0);
          const requiredQty = Number(item.quantity || 1);
          if (currentStock < requiredQty) {
            throw new Error(`INSUFFICIENT_STOCK:${item.name}|Disponibles: ${currentStock} unds|Requeridos: ${requiredQty} unds`);
          }
          productDataMap.push({
            ref: productRef,
            updatedStock: Math.max(0, currentStock - requiredQty)
          });
        }

        // 2. ESCRITURAS (UPDATE): Una vez finalizadas absolutamente todas las lecturas, aplicar las restas de stock
        for (const prod of productDataMap) {
          transaction.update(prod.ref, { stock: prod.updatedStock, updatedAt: serverTimestamp() });
        }

        // 3. Marcar orden como confirmada y con stock descontado
        transaction.update(orderRef, {
          paymentStatus: newStatus,
          status: "Confirmado",
          stockDeducted: true,
          updatedAt: serverTimestamp()
        });
      });
      return true;
    } else if (!isConfirmingPayment && alreadyDeducted) {
      // Si el pedido ya tenía stock restado (Pagado) y el Admin lo cambia a "No pago" / "Pendiente", restaurar stock
      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) return;
        const orderData = orderSnap.data();
        if (!orderData.stockDeducted) {
          transaction.update(orderRef, { paymentStatus: newStatus, status: newStatus === 'No pago' ? 'Cancelado' : 'Pendiente', updatedAt: serverTimestamp() });
          return;
        }
        
        const items = orderData.items || [];
        
        // 1. LECTURAS (GET): Leer todos los productos a restaurar PRIMERO
        const productUpdates = [];
        for (const item of items) {
          if (!item.id) continue;
          const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
          const productSnap = await transaction.get(productRef);
          if (productSnap.exists()) {
            const currentStock = Number(productSnap.data().stock || 0);
            productUpdates.push({
              ref: productRef,
              updatedStock: currentStock + Number(item.quantity || 1)
            });
          }
        }

        // 2. ESCRITURAS (UPDATE): Realizar todas las restauraciones una vez terminadas las lecturas
        for (const prod of productUpdates) {
          transaction.update(prod.ref, { stock: prod.updatedStock, updatedAt: serverTimestamp() });
        }

        transaction.update(orderRef, {
          paymentStatus: newStatus,
          status: newStatus === 'No pago' ? 'Cancelado' : 'Pendiente',
          stockDeducted: false,
          updatedAt: serverTimestamp()
        });
      });
      return true;
    } else {
      // Solo actualización del estado sin movimiento de stock
      await updateDoc(orderRef, {
        paymentStatus: newStatus,
        status: isConfirmingPayment ? 'Confirmado' : (newStatus === 'No pago' ? 'Cancelado' : 'Pendiente'),
        updatedAt: serverTimestamp()
      });
      return true;
    }
  } catch (error) {
    console.error("Error al actualizar estado de pago:", error);
    throw error;
  }
};

// Datos semilla de muestra estilo GoPet.pe para inicializar la base de datos si está vacía
export const seedInitialProducts = async () => {
  const initialData = [
    {
      name: "Alimento Pro Plan Adulto Raza Mediana 15kg",
      brand: "Pro Plan",
      category: "comida",
      petType: "perro",
      price: 245.90,
      stock: 18,
      minStock: 5,
      description: "Alimento super premium formulado con carne fresca de pollo como primer ingrediente. Ayuda a mantener una salud digestiva óptima y un pelaje brillante.",
      imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Hill's Science Diet Gato Adulto Pollo & Arroz 3kg",
      brand: "Hill's",
      category: "comida",
      petType: "gato",
      price: 139.00,
      discountPrice: 119.00,
      stock: 12,
      minStock: 4,
      description: "Nutrición balanceada con precisión para el estilo de vida de gatos adultos de 1 a 6 años. Alta taurina para la salud cardíaca.",
      imageUrl: "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Rascador Torre 3 Niveles con Hamaca para Gato",
      brand: "GoPet",
      category: "accesorios",
      petType: "gato",
      price: 165.50,
      stock: 7,
      minStock: 3,
      description: "Torre rascadora recubierta en felpa suave con postes de sisal natural y hamaca colgante de descanso.",
      imageUrl: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Juguete KONG Classic Masticable para Perro",
      brand: "KONG",
      category: "accesorios",
      petType: "perro",
      price: 54.90,
      stock: 30,
      minStock: 8,
      description: "El estándar de oro en juguetes para perros durante más de cuarenta años. Goma roja natural ultra resistente para rellenar con bocadillos.",
      imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Bravecto Antiparasitario Tableta Masticable Perro 20-40kg",
      brand: "Bravecto",
      category: "medicinas",
      petType: "perro",
      price: 135.00,
      stock: 3,
      minStock: 6,
      description: "Protección continua y eficaz hasta por 12 semanas contra pulgas y garrapatas con una sola dosis deliciosa.",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Advocate Pipeta Antiparasitaria para Gato de 4 a 8kg",
      brand: "Bayer",
      category: "medicinas",
      petType: "gato",
      price: 68.00,
      discountPrice: 59.90,
      stock: 15,
      minStock: 5,
      description: "Solución tópica de acción rápida y amplio espectro contra pulgas, ácaros, gusanos del corazón y parásitos intestinales.",
      imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Cama Ortopédica Memory Foam Impermeable L",
      brand: "GoPet",
      category: "accesorios",
      petType: "perro",
      price: 189.90,
      stock: 4,
      minStock: 3,
      description: "Cama con espuma viscoelástica que alivia la presión en las articulaciones. Funda extraíble y lavable de alta resistencia.",
      imageUrl: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Nutri-Plus Gel Suplemento Vitamínico Alta Energía 120g",
      brand: "Virbac",
      category: "medicinas",
      petType: "general",
      price: 49.50,
      stock: 22,
      minStock: 6,
      description: "Complemento nutricional altamente apetecible en gel para perros y gatos en convalecencia, gestación, lactancia o crecimiento rápido.",
      imageUrl: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Alimento Natural Gourmet en Lata Pollo y Pavo Gato 85g",
      brand: "Gourmet",
      category: "comida",
      petType: "gato",
      price: 9.90,
      discountPrice: 7.90,
      stock: 45,
      minStock: 15,
      description: "Alimento húmedo completo elaborado con finos trozos de pollo y pavo en salsa natural. Libre de granos y conservantes artificiales.",
      imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop&q=80"
    },
    {
      name: "Correa Retráctil Flexi New Classic 5m hasta 25kg",
      brand: "Flexi",
      category: "accesorios",
      petType: "perro",
      price: 79.00,
      stock: 9,
      minStock: 4,
      description: "Correa con sistema de frenado corto de alta precisión y asa ergonómica para paseos seguros y cómodos.",
      imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80"
    }
  ];

  for (const item of initialData) {
    await addProduct(item);
  }
  return initialData.length;
};
