import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import store from "./main/redux/Store";
import reportWebVitals from "./reportWebVitals";
import TNoodleAuthContext from "./main/api/TNoodleAuthContext";

const root = createRoot(document.getElementById("root") as HTMLDivElement);

root.render(
    <Provider store={store}>
        <TNoodleAuthContext>
            <App />
        </TNoodleAuthContext>
    </Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
