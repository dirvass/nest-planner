import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import Home from "./Home";
import PlannerPage from "./PlannerPage";
import BookingPage from "./BookingPage";
import GalleryPage from "./GalleryPage";
import "./styles.css";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
