import GalleryPage from "./GalleryPage";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import PlannerPage from "./PlannerPage";
import BookingPage from "./BookingPage";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/planner" element={<PlannerPage />} />
  <Route path="/book" element={<BookingPage />} />
  <Route path="/gallery" element={<GalleryPage />} />
</Routes>
    </BrowserRouter>
  );
}
