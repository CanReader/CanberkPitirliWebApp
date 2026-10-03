import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App";
import CommandPalette from "./components/CommandPalette";
import "./index.css";

const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const SeriesPage = lazy(() => import("./pages/SeriesPage"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DemoGallery = import.meta.env.DEV ? lazy(() => import("./pages/DemoGallery")) : null;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* reducedMotion="user" makes framer-motion respect prefers-reduced-motion */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <CommandPalette />
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/topic/:topic" element={<BlogList />} />
            <Route path="/blog/series/:id" element={<SeriesPage />} />
            {DemoGallery && <Route path="/blog/demos" element={<DemoGallery />} />}
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>
);
