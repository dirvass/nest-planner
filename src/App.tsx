import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import Home from "./Home";
import StoryPage from "./StoryPage";
import ExperiencePage from "./ExperiencePage";
import BookingPage from "./BookingPage";
import GalleryPage from "./GalleryPage";
import AdminPage from "./AdminPage";
import InvestorPage from "./InvestorPage";
import PasswordGate from "./components/PasswordGate";
import NotFoundPage from "./NotFoundPage";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/investor" element={<PasswordGate><InvestorPage /></PasswordGate>} />
          <Route path="/admin" element={<PasswordGate><AdminPage /></PasswordGate>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
