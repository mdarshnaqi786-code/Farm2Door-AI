import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, FarmerProduct, CustomerOrder, BulkQuoteRequest, FarmerEnquiry, AdminProductPriceRange } from '../types';

// Initialize Firebase App safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Cloud Firestore with dedicated databaseId
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || '(default)';

// Helper to strip undefined values so Firestore does not reject with unsupported undefined errors
function cleanForFirestore<T>(data: T): Record<string, any> {
  return JSON.parse(JSON.stringify(data));
}

// ----------------------------------------------------------------------------
// USERS FIRESTORE SYNC
// ----------------------------------------------------------------------------

export async function fetchUsersFromFirestore(): Promise<UserAccount[]> {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users: UserAccount[] = [];
    snapshot.forEach((d) => {
      users.push(d.data() as UserAccount);
    });
    return users;
  } catch (error) {
    console.warn('[Firestore] Error fetching users:', error);
    return [];
  }
}

export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, cleanForFirestore(user), { merge: true });
    console.log('[Firestore] User saved successfully:', user.id);
  } catch (error) {
    console.warn('[Firestore] Warning saving user:', error);
  }
}

export async function updateUserApprovalInFirestore(userId: string, approvalStatus: 'pending' | 'approved' | 'rejected'): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { approvalStatus });
    console.log('[Firestore] User approval status updated in cloud:', userId, approvalStatus);
  } catch (error) {
    console.warn('[Firestore] Warning updating user approval:', error);
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    console.log('[Firestore] User deleted from cloud:', userId);
  } catch (error) {
    console.warn('[Firestore] Warning deleting user:', error);
  }
}

// ----------------------------------------------------------------------------
// PRODUCTS FIRESTORE SYNC
// ----------------------------------------------------------------------------

export async function fetchProductsFromFirestore(): Promise<FarmerProduct[]> {
  try {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    const products: FarmerProduct[] = [];
    snapshot.forEach((d) => {
      products.push(d.data() as FarmerProduct);
    });
    return products;
  } catch (error) {
    console.warn('[Firestore] Error fetching products:', error);
    return [];
  }
}

export async function saveProductToFirestore(product: FarmerProduct): Promise<void> {
  try {
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, cleanForFirestore(product), { merge: true });
    console.log('[Firestore] Product saved to cloud:', product.id);
  } catch (error) {
    console.warn('[Firestore] Warning saving product:', error);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    console.log('[Firestore] Product deleted from cloud:', productId);
  } catch (error) {
    console.warn('[Firestore] Warning deleting product:', error);
  }
}

// ----------------------------------------------------------------------------
// ORDERS FIRESTORE SYNC
// ----------------------------------------------------------------------------

export async function fetchOrdersFromFirestore(): Promise<CustomerOrder[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const snapshot = await getDocs(ordersCol);
    const orders: CustomerOrder[] = [];
    snapshot.forEach((d) => {
      orders.push(d.data() as CustomerOrder);
    });
    return orders;
  } catch (error) {
    console.warn('[Firestore] Error fetching orders:', error);
    return [];
  }
}

export async function saveOrderToFirestore(order: CustomerOrder): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, cleanForFirestore(order), { merge: true });
    console.log('[Firestore] Order recorded in cloud:', order.id);
  } catch (error) {
    console.warn('[Firestore] Warning saving order:', error);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: CustomerOrder['status']): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    console.log('[Firestore] Order status updated in cloud:', orderId, status);
  } catch (error) {
    console.warn('[Firestore] Warning updating order status:', error);
  }
}

// ----------------------------------------------------------------------------
// BULK QUOTES FIRESTORE SYNC
// ----------------------------------------------------------------------------

export async function fetchBulkQuotesFromFirestore(): Promise<BulkQuoteRequest[]> {
  try {
    const quotesCol = collection(db, 'bulk_quotes');
    const snapshot = await getDocs(quotesCol);
    const quotes: BulkQuoteRequest[] = [];
    snapshot.forEach((d) => {
      quotes.push(d.data() as BulkQuoteRequest);
    });
    return quotes;
  } catch (error) {
    console.warn('[Firestore] Error fetching bulk quotes:', error);
    return [];
  }
}

export async function saveBulkQuoteToFirestore(quote: BulkQuoteRequest): Promise<void> {
  try {
    const quoteRef = doc(db, 'bulk_quotes', quote.id);
    await setDoc(quoteRef, cleanForFirestore(quote), { merge: true });
    console.log('[Firestore] Bulk quote saved to cloud:', quote.id);
  } catch (error) {
    console.warn('[Firestore] Warning saving bulk quote:', error);
  }
}

// ----------------------------------------------------------------------------
// ENQUIRIES FIRESTORE SYNC
// ----------------------------------------------------------------------------

export async function fetchEnquiriesFromFirestore(): Promise<FarmerEnquiry[]> {
  try {
    const enquiriesCol = collection(db, 'enquiries');
    const snapshot = await getDocs(enquiriesCol);
    const enquiries: FarmerEnquiry[] = [];
    snapshot.forEach((d) => {
      enquiries.push(d.data() as FarmerEnquiry);
    });
    return enquiries;
  } catch (error) {
    console.warn('[Firestore] Error fetching enquiries:', error);
    return [];
  }
}

export async function saveEnquiryToFirestore(enquiry: FarmerEnquiry): Promise<void> {
  try {
    const enquiryRef = doc(db, 'enquiries', enquiry.id);
    await setDoc(enquiryRef, cleanForFirestore(enquiry), { merge: true });
    console.log('[Firestore] Farmer enquiry saved to cloud:', enquiry.id);
  } catch (error) {
    console.warn('[Firestore] Warning saving enquiry:', error);
  }
}

export async function replyEnquiryInFirestore(enquiryId: string, replyMessage: string): Promise<void> {
  try {
    const enquiryRef = doc(db, 'enquiries', enquiryId);
    await updateDoc(enquiryRef, {
      replied: true,
      replyMessage,
    });
    console.log('[Firestore] Farmer reply recorded in cloud:', enquiryId);
  } catch (error) {
    console.warn('[Firestore] Warning replying to enquiry:', error);
  }
}

// ----------------------------------------------------------------------------
// REALTIME LISTENERS HELPER
// ----------------------------------------------------------------------------

export function subscribeToProducts(callback: (products: FarmerProduct[]) => void) {
  try {
    const productsCol = collection(db, 'products');
    return onSnapshot(productsCol, (snapshot) => {
      const items: FarmerProduct[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as FarmerProduct);
      });
      callback(items);
    }, (err) => {
      console.warn('[Firestore] Products listener warning:', err);
    });
  } catch (e) {
    console.warn('[Firestore] Products subscription error:', e);
    return () => {};
  }
}

export function subscribeToOrders(callback: (orders: CustomerOrder[]) => void) {
  try {
    const ordersCol = collection(db, 'orders');
    return onSnapshot(ordersCol, (snapshot) => {
      const items: CustomerOrder[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CustomerOrder);
      });
      callback(items);
    }, (err) => {
      console.warn('[Firestore] Orders listener warning:', err);
    });
  } catch (e) {
    console.warn('[Firestore] Orders subscription error:', e);
    return () => {};
  }
}

// ----------------------------------------------------------------------------
// ADMIN PRICE RANGE CONTROLS FIRESTORE SYNC
// ----------------------------------------------------------------------------

export async function fetchAdminPriceRangesFromFirestore(): Promise<AdminProductPriceRange[]> {
  try {
    const rangesCol = collection(db, 'admin_price_ranges');
    const snapshot = await getDocs(rangesCol);
    const ranges: AdminProductPriceRange[] = [];
    snapshot.forEach((d) => {
      ranges.push(d.data() as AdminProductPriceRange);
    });
    return ranges;
  } catch (error) {
    console.warn('[Firestore] Error fetching admin price ranges:', error);
    return [];
  }
}

export async function saveAdminPriceRangeToFirestore(range: AdminProductPriceRange): Promise<void> {
  try {
    const rangeRef = doc(db, 'admin_price_ranges', range.id);
    await setDoc(rangeRef, cleanForFirestore(range), { merge: true });
    console.log('[Firestore] Admin price range saved:', range.productName);
  } catch (error) {
    console.warn('[Firestore] Error saving admin price range:', error);
  }
}

export async function deleteAdminPriceRangeFromFirestore(id: string): Promise<void> {
  try {
    const rangeRef = doc(db, 'admin_price_ranges', id);
    await deleteDoc(rangeRef);
  } catch (error) {
    console.warn('[Firestore] Error deleting admin price range:', error);
  }
}

export function subscribeToAdminPriceRanges(callback: (ranges: AdminProductPriceRange[]) => void) {
  try {
    const rangesCol = collection(db, 'admin_price_ranges');
    return onSnapshot(rangesCol, (snapshot) => {
      const items: AdminProductPriceRange[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AdminProductPriceRange);
      });
      callback(items);
    }, (err) => {
      console.warn('[Firestore] Admin price ranges listener warning:', err);
    });
  } catch (e) {
    console.warn('[Firestore] Admin price ranges subscription error:', e);
    return () => {};
  }
}
