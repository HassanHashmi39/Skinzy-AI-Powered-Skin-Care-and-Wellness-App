export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) return { isValid: false, message: "Password is required." };
  
  if (password.length < 6) return { isValid: false, message: "Password must be at least 6 characters." };
  if (password.length > 16) return { isValid: false, message: "Password must not exceed 16 characters." };
  
  if (password.startsWith(' ') || password.endsWith(' ')) {
    return { isValid: false, message: "Password cannot start or end with spaces." };
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one letter." };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number." };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character." };
  }
  
  return { isValid: true, message: "" };
};

export const filterNameInput = (text: string): string => {
  return text.replace(/[^a-zA-Z\s]/g, '');
};

export const filterPhoneInput = (text: string): string => {
  return text.replace(/[^0-9\s+]/g, '');
};

export const filterNumberInput = (text: string): string => {
  return text.replace(/[^0-9]/g, '');
};
