export function calculateAge(birthDate: Date): number {
  // Get current date in EST
  const now = new Date();
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  const currentYear = estTime.getFullYear();
  const currentMonth = estTime.getMonth();
  const currentDay = estTime.getDate();
  
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();
  
  let age = currentYear - birthYear;
  
  // Check if birthday hasn't occurred this year
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }
  
  return age;
} 