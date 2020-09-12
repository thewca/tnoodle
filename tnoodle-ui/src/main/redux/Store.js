import { createStore } from "redux";
import { Reducer } from "./Reducers";

const store = createStore(Reducer);
export default store;
