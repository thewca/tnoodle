import store from "../redux/Store";

type RootState = ReturnType<typeof store.getState>;

export default RootState;
