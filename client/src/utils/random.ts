
import { walmartLocations } from './walmart-locations';

const firstNames = ['JOHN', 'MARY', 'ROBERT', 'PATRICIA', 'MICHAEL', 'JENNIFER', 'WILLIAM', 'LINDA', 'DAVID', 'ELIZABETH'];
const lastNames = ['SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA', 'MILLER', 'DAVIS', 'RODRIGUEZ', 'MARTINEZ'];

export function generateRandomId(length: number = 5): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

export function generateRandomPhone(): string {
  // If we want to use authentic location data, use getRandomWalmartLocation().phone instead
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

export function generateRandomManager(): string {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export function getRandomWalmartLocation() {
  return walmartLocations[Math.floor(Math.random() * walmartLocations.length)];
}

export function generateRandomLocation() {
  const location = getRandomWalmartLocation();
  return {
    address: location.address,
    city: location.city,
    stateZip: `${location.state} ${location.zip}`,
    phone: location.phone,
    storeNumber: location.storeNumber
  };
}

export function generateRandomSurveyCode(): string {
  return Array(11).fill(0).map(() => 
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
  ).join('');
}

export function generateRandomStoreNumber(): string {
  // For authentic store numbers, use getRandomWalmartLocation().storeNumber instead
  return Math.floor(Math.random() * 9000 + 1000).toString();
}

/**
 * Generate a random register number between 1 and 40
 */
export function generateRandomRegister(): string {
  return Math.floor(Math.random() * 40 + 1).toString();
}

/**
 * Generate a random date and time within the past 14 days,
 * with time between 6 AM and 11 PM
 */
export function generateRandomDateTime(): string {
  // Get current date
  const now = new Date();
  
  // Generate a random day within the past 14 days
  const daysAgo = Math.floor(Math.random() * 14);
  const randomDate = new Date(now);
  randomDate.setDate(now.getDate() - daysAgo);
  
  // Set a random hour between 6 AM and 11 PM (6 to 23)
  const randomHour = Math.floor(Math.random() * 18) + 6; // 18 possible hours (6AM to 11PM)
  randomDate.setHours(randomHour);
  
  // Set random minutes
  randomDate.setMinutes(Math.floor(Math.random() * 60));
  
  // Format as YYYY-MM-DDThh:mm (compatible with datetime-local input)
  return randomDate.toISOString().slice(0, 16);
}
