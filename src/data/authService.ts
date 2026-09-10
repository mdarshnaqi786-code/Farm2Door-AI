import { UserAccount, UserRole, ApprovalStatus } from '../types';

export const DEFAULT_ADMIN: UserAccount = {
  id: 'usr-admin-naqi',
  fullName: 'naqi',
  contact: 'mdarshnaqi786@gmail.com',
  email: 'mdarshnaqi786@gmail.com',
  password: '123456',
  role: 'admin',
  language: 'en',
  approvalStatus: 'approved',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const SEED_USERS: UserAccount[] = [
  DEFAULT_ADMIN,
  {
    id: 'usr-farmer-ramesh',
    fullName: 'Ramesh Patil',
    contact: '+91 98765 43210',
    email: 'ramesh.patil@kisan.in',
    password: '123456',
    role: 'farmer',
    language: 'hi',
    fpoOrOrgName: 'Sahyadri Kisan Producer Co.',
    location: 'Nashik, Maharashtra',
    approvalStatus: 'approved',
    createdAt: '2026-03-01T08:30:00.000Z',
  },
  {
    id: 'usr-farmer-suresh',
    fullName: 'Suresh Kumar',
    contact: '+91 91234 56789',
    email: 'suresh.k@kisanmail.in',
    password: '123456',
    role: 'farmer',
    language: 'te',
    fpoOrOrgName: 'Krishna Valley Organic FPO',
    location: 'Guntur, Andhra Pradesh',
    approvalStatus: 'pending',
    createdAt: '2026-09-08T10:15:00.000Z',
  },
  {
    id: 'usr-farmer-ananya',
    fullName: 'Ananya Reddy',
    contact: '+91 99887 76655',
    email: 'ananya.reddy@farmfresh.in',
    password: '123456',
    role: 'farmer',
    language: 'te',
    fpoOrOrgName: 'Rayalaseema Agro Producers',
    location: 'Kurnool, Andhra Pradesh',
    approvalStatus: 'pending',
    createdAt: '2026-09-09T14:40:00.000Z',
  },
  {
    id: 'usr-consumer-priya',
    fullName: 'Priya Sharma',
    contact: 'priya.sharma@example.com',
    email: 'priya.sharma@example.com',
    password: '123456',
    role: 'consumer',
    language: 'en',
    approvalStatus: 'approved',
    createdAt: '2026-03-05T12:00:00.000Z',
  },
];

const STORAGE_USERS_KEY = 'farm2door_registered_users';
const STORAGE_SESSION_KEY = 'farm2door_user_session';

/**
 * Retrieves all registered users from localStorage, initializing with seed users if not present.
 */
export const getRegisteredUsers = (): UserAccount[] => {
  if (typeof window === 'undefined') return SEED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const parsed: UserAccount[] = JSON.parse(raw);
    
    // Ensure default admin always exists in stored list
    const hasAdmin = parsed.some(
      (u) => u.role === 'admin' && (u.email === DEFAULT_ADMIN.email || u.contact === DEFAULT_ADMIN.contact)
    );
    if (!hasAdmin) {
      parsed.unshift(DEFAULT_ADMIN);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse registered users:', err);
    return SEED_USERS;
  }
};

/**
 * Saves users list to localStorage.
 */
export const saveRegisteredUsers = (users: UserAccount[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users:', err);
  }
};

/**
 * Gets currently logged in user session.
 */
export const getCurrentUserSession = (): UserAccount | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Sets or clears the current user session in localStorage.
 */
export const setCurrentUserSession = (account: UserAccount | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (account) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(account));
      if (account.language) {
        localStorage.setItem('farm2door_preferred_language', account.language);
      }
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch (err) {
    console.warn('Failed to update session:', err);
  }
};

/**
 * Registers a new user.
 * - Admin cannot be created freely.
 * - Farmers start with status: 'pending' (cannot access features until approved).
 * - Customers start with status: 'approved' (can use normally).
 */
export const registerUser = (details: {
  fullName: string;
  contact: string;
  email?: string;
  password?: string;
  role: UserRole;
  language: string;
  fpoOrOrgName?: string;
  location?: string;
}): {
  success: boolean;
  account?: UserAccount;
  error?: string;
  isPending?: boolean;
} => {
  const { fullName, contact, email, password, role, language, fpoOrOrgName, location } = details;

  // Rule: Admin cannot be freely created by users.
  if (role === 'admin') {
    return {
      success: false,
      error:
        'Admin accounts cannot be created by users. There is only one predefined administrator account for Farm2Door AI (Email: mdarshnaqi786@gmail.com).',
    };
  }

  const users = getRegisteredUsers();
  const normalizedContact = contact.trim().toLowerCase();
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  // Check if already exists for this role
  const existing = users.find((u) => {
    if (u.role !== role) return false;
    const uContact = u.contact.toLowerCase();
    const uEmail = (u.email || '').toLowerCase();
    return (
      uContact === normalizedContact ||
      (normalizedEmail && (uContact === normalizedEmail || uEmail === normalizedEmail))
    );
  });

  if (existing) {
    return {
      success: false,
      error: `An account with this contact (${contact}) is already registered as a ${role}. Please log in instead.`,
    };
  }

  // Farmer starts as 'pending'. Customer & Bulk Buyer start as 'approved'.
  const initialStatus: ApprovalStatus = role === 'farmer' ? 'pending' : 'approved';

  const newAccount: UserAccount = {
    id: `usr-${role}-${Date.now()}`,
    fullName: fullName.trim(),
    contact: contact.trim(),
    email: email ? email.trim() : (contact.includes('@') ? contact.trim() : undefined),
    password: password || '123456',
    role,
    language: language || (role === 'farmer' ? 'hi' : 'en'),
    fpoOrOrgName: fpoOrOrgName?.trim(),
    location: location?.trim() || (role === 'farmer' ? 'Andhra Pradesh, India' : undefined),
    approvalStatus: initialStatus,
    createdAt: new Date().toISOString(),
  };

  users.push(newAccount);
  saveRegisteredUsers(users);

  return {
    success: true,
    account: newAccount,
    isPending: initialStatus === 'pending',
  };
};

/**
 * Authenticates a user based on role, identifier (email or phone), and password.
 * - Enforces admin credentials (mdarshnaqi786@gmail.com / 123456).
 * - Enforces farmer approval status (blocks pending and rejected farmers).
 * - Customers log in normally.
 */
export const loginUser = (
  role: UserRole,
  identifier: string,
  password: string
): {
  success: boolean;
  account?: UserAccount;
  error?: string;
  status?: ApprovalStatus;
} => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Admin Authentication
  if (role === 'admin') {
    const isEmailMatch =
      cleanId === DEFAULT_ADMIN.email?.toLowerCase() ||
      cleanId === DEFAULT_ADMIN.contact.toLowerCase() ||
      cleanId === 'naqi';
    const isPassMatch = cleanPass === DEFAULT_ADMIN.password;

    if (isEmailMatch && isPassMatch) {
      return {
        success: true,
        account: DEFAULT_ADMIN,
        status: 'approved',
      };
    } else {
      return {
        success: false,
        error:
          'Invalid Admin credentials. Please check the administrator email (mdarshnaqi786@gmail.com) and password.',
      };
    }
  }

  // 2. Farmer or Customer Authentication
  const users = getRegisteredUsers();
  
  // Find matching account
  let account = users.find((u) => {
    if (u.role !== role) return false;
    const matchContact = u.contact.toLowerCase() === cleanId;
    const matchEmail = (u.email || '').toLowerCase() === cleanId;
    return matchContact || matchEmail;
  });

  // If no account was found in storage:
  // For easy testing, if a farmer or customer uses a recognized contact or demo input,
  // we check if it matches seed or we auto-create with appropriate status
  if (!account) {
    if (role === 'farmer') {
      // If someone types an unregistered farmer number, inform them to register first or use demo
      return {
        success: false,
        error: `No registered farmer found for "${identifier}". Please create an account via the Sign Up tab.`,
      };
    } else {
      // Customer can log in with standard credentials
      const newCustomer: UserAccount = {
        id: `usr-consumer-${Date.now()}`,
        fullName: cleanId.includes('@') ? cleanId.split('@')[0] : 'Valued Customer',
        contact: identifier.trim(),
        email: cleanId.includes('@') ? identifier.trim() : undefined,
        password: cleanPass,
        role: 'consumer',
        language: 'en',
        approvalStatus: 'approved',
        createdAt: new Date().toISOString(),
      };
      users.push(newCustomer);
      saveRegisteredUsers(users);
      account = newCustomer;
    }
  }

  // Verify password if account has one set
  if (account.password && account.password !== cleanPass) {
    return {
      success: false,
      error: 'Incorrect password. Please try again or use the demo password (123456).',
    };
  }

  // 3. Farmer Approval Check (CRITICAL REQUIREMENT)
  if (role === 'farmer') {
    const status = account.approvalStatus || 'approved'; // legacy fallback

    if (status === 'pending') {
      return {
        success: false,
        status: 'pending',
        account,
        error: `Account Approval Pending: Your farmer registration is currently under review by Admin (naqi). You cannot access farmer features until approved.`,
      };
    }

    if (status === 'rejected') {
      return {
        success: false,
        status: 'rejected',
        account,
        error: `Account Rejected: Your farmer application has been reviewed and rejected by Admin. You remain unable to access farmer features. Please contact mdarshnaqi786@gmail.com for assistance.`,
      };
    }
  }

  return {
    success: true,
    account,
    status: account.approvalStatus || 'approved',
  };
};

/**
 * Admin Action: Approve or Reject a Farmer
 */
export const updateFarmerStatus = (
  farmerId: string,
  newStatus: 'approved' | 'rejected'
): { success: boolean; updatedUser?: UserAccount } => {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === farmerId && u.role === 'farmer');
  
  if (index === -1) {
    return { success: false };
  }

  users[index].approvalStatus = newStatus;
  saveRegisteredUsers(users);

  // If this farmer is currently in active session, update session
  const currentSession = getCurrentUserSession();
  if (currentSession && currentSession.id === farmerId) {
    currentSession.approvalStatus = newStatus;
    setCurrentUserSession(currentSession);
  }

  return {
    success: true,
    updatedUser: users[index],
  };
};

/**
 * Get all farmers (for Admin Dashboard)
 */
export const getFarmersList = (): UserAccount[] => {
  return getRegisteredUsers().filter((u) => u.role === 'farmer');
};

/**
 * Get all customers (for Admin Dashboard)
 */
export const getCustomersList = (): UserAccount[] => {
  return getRegisteredUsers().filter((u) => u.role === 'consumer');
};

/**
 * Allows the admin to change their password securely.
 */
export const changeAdminPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  if (!currentPassword || !newPassword) {
    return { success: false, error: 'Current password and new password are required.' };
  }
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  // Call server-side API if available
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('farm2door_auth_token') : null;
    if (token) {
      const resp = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (resp.ok) {
        return { success: true };
      }
      const data = await resp.json();
      if (data.message) {
        return { success: false, error: data.message };
      }
    }
  } catch (err) {
    console.warn('Server admin change password error, using local fallback:', err);
  }

  // Local storage fallback
  const users = getRegisteredUsers();
  const adminIndex = users.findIndex((u) => u.role === 'admin');
  if (adminIndex !== -1) {
    if (users[adminIndex].password && users[adminIndex].password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    users[adminIndex].password = newPassword;
    saveRegisteredUsers(users);
    return { success: true };
  }

  return { success: false, error: 'Admin account not found.' };
};

