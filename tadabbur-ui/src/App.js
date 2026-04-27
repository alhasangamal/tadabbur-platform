import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppLayout from "./components/layout/AppLayout";
import SplashScreen from "./components/layout/SplashScreen";
import PageLoader from "./components/common/PageLoader";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { QuranDataProvider, useQuranData } from "./context/QuranDataContext";
import { AudioProvider } from "./context/AudioContext";
import { BookmarkProvider } from "./context/BookmarkContext";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
const EndingsPage = lazy(() => import("./pages/EndingsPage"));
const CharactersPage = lazy(() => import("./pages/CharactersPage"));
const DialoguesPage = lazy(() => import("./pages/DialoguesPage"));
const CosmicPage = lazy(() => import("./pages/CosmicPage"));
const AqsamPage = lazy(() => import("./pages/AqsamPage"));
const ArqamPage = lazy(() => import("./pages/ArqamPage"));
const AsbabPage = lazy(() => import("./pages/AsbabPage"));
const DuasPage = lazy(() => import("./pages/DuasPage"));
const AsmaPage = lazy(() => import("./pages/AsmaPage"));

function ThemedToaster() {
  const { theme } = useQuranData();
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#1e293b' : '#ffffff',
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          padding: '16px 24px',
          borderRadius: '24px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          direction: 'rtl'
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <QuranDataProvider>
          <AudioProvider>
            <BookmarkProvider>
              {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
              <Router>
                <ThemedToaster />
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
                        <Route path="/characters" element={<CharactersPage />} />
                        <Route path="/dialogues" element={<DialoguesPage />} />
                        <Route path="/cosmic" element={<CosmicPage />} />
                        <Route path="/aqsam" element={<AqsamPage />} />
                        <Route path="/arqam" element={<ArqamPage />} />
                        <Route path="/asbab" element={<AsbabPage />} />
                        <Route path="/duas" element={<DuasPage />} />
                        <Route path="/asma" element={<AsmaPage />} />
                        <Route path="/endings" element={<EndingsPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="*" element={<HomePage />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </AppLayout>
                <VerseSyncDisplay />
                <AudioPlayer />
              </Router>
            </BookmarkProvider>
          </AudioProvider>
        </QuranDataProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
