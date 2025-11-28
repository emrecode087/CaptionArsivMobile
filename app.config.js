import appJson from "./app.json";

export default ({ config }) => ({
  ...appJson.expo,

  android: {
    ...appJson.expo.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json"
  },

  ios: {
    ...appJson.expo.ios,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./GoogleService-Info.plist"
  },
});
