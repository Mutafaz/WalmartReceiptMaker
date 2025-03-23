
const firstNames = ['JOHN', 'MARY', 'ROBERT', 'PATRICIA', 'MICHAEL', 'JENNIFER', 'WILLIAM', 'LINDA', 'DAVID', 'ELIZABETH'];
const lastNames = ['SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA', 'MILLER', 'DAVIS', 'RODRIGUEZ', 'MARTINEZ'];
const cities = ['BENTONVILLE', 'ROGERS', 'SPRINGDALE', 'FAYETTEVILLE', 'FORT SMITH', 'LITTLE ROCK', 'CONWAY', 'JONESBORO'];
const states = ['AR', 'MO', 'OK', 'TX', 'TN', 'MS', 'LA'];

export function generateRandomId(length: number = 5): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

export function generateRandomPhone(): string {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

export function generateRandomManager(): string {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export function generateRandomLocation() {
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zip = Math.floor(Math.random() * 90000) + 10000;
  return {
    city,
    stateZip: `${state} ${zip}`
  };
}

export function generateRandomSurveyCode(): string {
  return Array(11).fill(0).map(() => 
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
  ).join('');
}

export function generateRandomStoreNumber(): string {
  return Math.floor(Math.random() * 9000 + 1000).toString();
}
