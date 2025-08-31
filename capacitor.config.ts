import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7a239f9b42334c40b53a6c3637f2599a',
  appName: 'Smart Task Manager',
  webDir: 'dist',
  server: {
    url: 'https://7a239f9b-4233-4c40-b53a-6c3637f2599a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#248f5f',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff'
    }
  }
};

export default config;