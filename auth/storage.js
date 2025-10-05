import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "dm_access_token";
const REFRESH_KEY = "dm_refresh_token";

export async function saveTokens({ access, refresh }) {
    if (access) await SecureStore.setItemAsync(ACCESS_KEY, access);
    if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function getTokens() {
    const access = await SecureStore.getItemAsync(ACCESS_KEY);
    const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
    return { access, refresh };
}

export async function clearTokens() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
}