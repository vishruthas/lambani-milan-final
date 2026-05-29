/*import { Buffer } from "buffer";
import process from "process";
import "./awsConfig";

window.Buffer = Buffer;
window.process = process; */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./awsConfig";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);