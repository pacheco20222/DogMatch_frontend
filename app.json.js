// DogMatch_frontend/app.config.js
export default {
  expo: {
    name: "DogMatch_frontend",
    slug: "DogMatch_frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-secure-store"
    ],
    extra: {
      API_URL: process.env.API_URL || "https://dogmatch-api-app-hnh2dqhcgag9d4g4.westus3-01.azurewebsites.net",
      SOCKET_URL: process.env.SOCKET_URL || "https://dogmatch-api-app-hnh2dqhcgag9d4g4.westus3-01.azurewebsites.net",
      ENV: process.env.ENV || "production"
    }
  }
};