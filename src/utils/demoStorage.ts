export interface DemoSetupData {
  userName: string;
  userEmail: string;
  timestamp: number;
}

export const saveDemoSetupData = (data: DemoSetupData): void => {
  try {
    localStorage.setItem('demoSetupData', JSON.stringify(data));
    sessionStorage.setItem('demoSetupData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving demo setup data:', error);
    throw error;
  }
};

export const getDemoSetupData = (): DemoSetupData | null => {
  try {
    // Try localStorage first, then sessionStorage as fallback
    const localData = localStorage.getItem('demoSetupData');
    if (localData) {
      return JSON.parse(localData);
    }

    const sessionData = sessionStorage.getItem('demoSetupData');
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving demo setup data:', error);
    return null;
  }
};

export const clearDemoSetupData = (): void => {
  try {
    localStorage.removeItem('demoSetupData');
    sessionStorage.removeItem('demoSetupData');
  } catch (error) {
    console.error('Error clearing demo setup data:', error);
  }
};

export const hasDemoSetupData = (): boolean => {
  return getDemoSetupData() !== null;
};