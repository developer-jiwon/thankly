export function generateUserId(name: string): string {
  const timestamp = Date.now().toString(36);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const shortHash = Math.random().toString(36).substring(2, 6);
  return `${cleanName}-${shortHash}`;
}

export function getUserId(): string {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // Return null if no userId exists - we'll handle this in the component
    return '';
  }
  return userId;
}

export function setUserId(name: string): string {
  const userId = generateUserId(name);
  localStorage.setItem('userId', userId);
  return userId;
} 