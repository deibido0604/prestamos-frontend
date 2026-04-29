import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { configureStore } from "@reduxjs/toolkit";

import { configSlice } from "../config/store/configSlice";
import { layoutSlice } from "../admin/layout/store/layoutSlice";

const rootReducer = combineReducers({
  config: configSlice.reducer,
  layout: layoutSlice.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["config", "layout",],
};

export const RESET_STORE = "RESET_STORE";

export const resetStore = () => ({
  type: RESET_STORE,
});

const appReducer = (state, action) => {
  if (action.type === RESET_STORE) {
    state = undefined;
  }
  return rootReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, appReducer);

const store = configureStore({ reducer: persistedReducer });

const persistor = persistStore(store);

export { store, persistor };
