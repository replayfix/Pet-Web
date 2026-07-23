import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";

const REVIEWS_COLLECTION = "reviews";
const PRODUCTS_COLLECTION = "products";

// Suscribirse a todas las reseñas en tiempo real (Para el Panel de Administración)
export const subscribeAllReviews = (callback, errorCallback) => {
  const q = query(collection(db, REVIEWS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      let timestamp = Date.now();
      if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
        timestamp = data.createdAt.toMillis();
      } else if (data.createdAt && data.createdAt.seconds) {
        timestamp = data.createdAt.seconds * 1000;
      }
      return {
        id: docSnap.id,
        ...data,
        timestamp
      };
    });
    // Ordenar por fecha descendente (más recientes primero)
    reviews.sort((a, b) => b.timestamp - a.timestamp);
    callback(reviews);
  }, (err) => {
    console.error("Error al escuchar reseñas en Firestore:", err);
    if (errorCallback) errorCallback(err);
  });
};

// Suscribirse a las reseñas aprobadas de un producto concreto (Para la Tienda / ProductDetailModal)
export const subscribeApprovedReviewsByProduct = (productId, callback, errorCallback) => {
  if (!productId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where("productId", "==", productId),
    where("status", "==", "approved")
  );
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      let timestamp = Date.now();
      if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
        timestamp = data.createdAt.toMillis();
      } else if (data.createdAt && data.createdAt.seconds) {
        timestamp = data.createdAt.seconds * 1000;
      }
      return {
        id: docSnap.id,
        ...data,
        timestamp
      };
    });
    reviews.sort((a, b) => b.timestamp - a.timestamp);
    callback(reviews);
  }, (err) => {
    console.error("Error al escuchar reseñas aprobadas:", err);
    if (errorCallback) errorCallback(err);
  });
};

// Crear una nueva reseña por parte de un cliente (se guarda en estado 'pending')
export const addReview = async ({ productId, productName, productImage, userId, userName, rating, comment }) => {
  try {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      productId,
      productName: productName || 'Producto de Pet.Web',
      productImage: productImage || '',
      userId: userId || 'anonimo@petweb.pe',
      userName: userName || 'Cliente de Pet.Web',
      rating: Number(rating) || 5,
      comment: comment || '',
      status: "pending", // Por seguridad las opiniones entran pendientes
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al enviar la reseña:", error);
    throw error;
  }
};

// Recalcular y actualizar automáticamente el promedio de estrellas y número total de opiniones de un producto
export const recalculateProductRating = async (productId) => {
  if (!productId) return;
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("productId", "==", productId),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    
    const approvedReviews = snapshot.docs.map(d => d.data());
    const count = approvedReviews.length;
    let average = 0;
    
    if (count > 0) {
      const sum = approvedReviews.reduce((acc, rev) => acc + Number(rev.rating || 0), 0);
      average = Number((sum / count).toFixed(1));
    }

    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, {
      ratingAverage: average,
      reviewCount: count
    });
    return { ratingAverage: average, reviewCount: count };
  } catch (error) {
    console.error(`Error al recalcular valoración para producto ${productId}:`, error);
  }
};

// Actualizar el estado de una reseña (Aprobar o Rechazar desde el Admin)
export const updateReviewStatus = async (reviewId, productId, newStatus) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(reviewRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    // Recalcular el promedio si se aprobó, o si fue rechazada una previamente aprobada
    if (productId) {
      await recalculateProductRating(productId);
    }
    return true;
  } catch (error) {
    console.error("Error al actualizar estado de reseña:", error);
    throw error;
  }
};

// Eliminar una reseña y recalcular las estadísticas de estrellas
export const deleteReview = async (reviewId, productId) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(reviewRef);

    if (productId) {
      await recalculateProductRating(productId);
    }
    return true;
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    throw error;
  }
};
