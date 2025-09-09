import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ConsentBanner } from "@/components/ConsentBanner";
import Homepage from "./pages/Homepage";
import PersonnummerPage from "./pages/PersonnummerPage";
import IpPage from "./pages/IpPage";
import SalaryPage from "./pages/SalaryPage";
import OcrPage from "./pages/OcrPage";
import FeedbackPage from "./pages/FeedbackPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <ConsentBanner />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/personnummer" element={<PersonnummerPage />} />
            <Route path="/ip" element={<IpPage />} />
            <Route path="/lon" element={<SalaryPage />} />
            <Route path="/ocr" element={<OcrPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/om" element={<AboutPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/sekretess" element={<PrivacyPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
