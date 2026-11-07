import store from "../redux/Store";

type RootState = ReturnType<typeof store.getState>;

export type { RootState as default };
