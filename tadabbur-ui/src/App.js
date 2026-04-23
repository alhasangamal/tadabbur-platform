import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppLayout from "./components/layout/AppLayout";
import SplashScreen from "./components/layout/SplashScreen";
import PageLoader from "./components/common/PageLoader";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { QuranDataProvider } from "./context/QuranDataContext";
import { AudioProvider } from "./context/AudioContext";
import { BookmarkProvider } from "./context/BookmarkContext";
import AudioPlayer from "./components/audio/AudioPlayer";
import VerseSyncDisplay from "./components/audio/VerseSyncDisplay";

// Lazy Loaded Pages
const HomePage = lazy(() => import("./pages/HomePage"));
const GraphPage = lazy(() => import("./pages/GraphPage"));
const AhkamPage = lazy(() => import("./pages/AhkamPage"));
const NasikhPage = lazy(() => import("./pages/NasikhPage"));
const TashriaatPage = lazy(() => import("./pages/TashriaatPage"));
const AmthalPage = lazy(() => import("./pages/AmthalPage"));
const MutashPage = lazy(() => import("./pages/MutashPage"));
const ContrastsPage = lazy(() => import("./pages/ContrastsPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const SurahsPage = lazy(() => import("./pages/SurahsPage"));
const SurahDetailsPage = lazy(() => import("./pages/SurahDetailsPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <HelmetProvider>
      <QuranDataProvider>
        <AudioProvider>
          <BookmarkProvider>
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <Router>
              <AppLayout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/graph" element={<GraphPage />} />
                      <Route path="/search" element={<SearchResultsPage />} />
                      <Route path="/bookmarks" element={<BookmarksPage />} />
                      <Route path="/surahs" element={<SurahsPage />} />
                      <Route path="/surahs/:id" element={<SurahDetailsPage />} />
                      <Route path="/ahkam" element={<AhkamPage />} />
                      <Route path="/nasikh" element={<NasikhPage />} />
                      <Route path="/tashriaat" element={<TashriaatPage />} />
                      <Route path="/amthal" element={<AmthalPage />} />
                      <Route path="/mutash" element={<MutashPage />} />
                      <Route path="/contrasts" element={<ContrastsPage />} />
                      <Route path="/stories" element={<StoriesPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="*" element={<HomePage />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </AppLayout>
              {/* Global UI Components */}
              <VerseSyncDisplay />
              <AudioPlayer />
            </Router>
          </BookmarkProvider>
        </AudioProvider>
      </QuranDataProvider>
    </HelmetProvider>
  );
}

export default App;