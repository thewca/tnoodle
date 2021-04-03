import { createStore } from "redux";
import { Reducer } from "./Reducers";

const store = createStore(Reducer as any);
export default store;
