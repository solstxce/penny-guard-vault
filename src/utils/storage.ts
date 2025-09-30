import { AppData } from "@/types/expense";
import { encrypt, decrypt } from "./encryption";

const STORAGE_KEY = "expense_tracker_data";
const PASSWORD_SETUP_KEY = "expense_tracker_setup";

export function isPasswordSet(): boolean {
  return localStorage.getItem(PASSWORD_SETUP_KEY) === "true";
}

export function setPasswordFlag(): void {
  localStorage.setItem(PASSWORD_SETUP_KEY, "true");
}

export async function saveData(data: AppData, password: string): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);
    const encrypted = await encrypt(jsonData, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
    if (!isPasswordSet()) {
      setPasswordFlag();
    }
  } catch (error) {
    console.error("Failed to save data:", error);
    throw new Error("Failed to save data. Please try again.");
  }
}

export async function loadData(password: string): Promise<AppData> {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      return { expenses: [], budgets: {} };
    }
    const decrypted = await decrypt(encrypted, password);
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error("Failed to decrypt data. Incorrect password.");
  }
}

export async function exportData(password: string): Promise<string> {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) {
    throw new Error("No data to export");
  }
  return encrypted;
}

export async function importData(encryptedData: string, password: string): Promise<void> {
  try {
    // Verify the data can be decrypted
    await decrypt(encryptedData, password);
    localStorage.setItem(STORAGE_KEY, encryptedData);
    setPasswordFlag();
  } catch (error) {
    throw new Error("Failed to import data. Invalid file or password.");
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PASSWORD_SETUP_KEY);
}
