import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AdminLogin from './Components/admin/login.jsx'; 
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<App/>}/>
            <Route path="/admin" element={<AdminLogin/>}/>
          </Routes> 
        </BrowserRouter>
    </React.StrictMode>
);
