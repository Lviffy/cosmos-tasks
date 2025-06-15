
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
      <div className="flex justify-center mt-8 gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition text-base font-medium shadow"
        >
          Go to Dashboard
        </Link>
        {!loading && !user && (
          <Link
            to="/auth"
            className="inline-flex items-center px-4 py-2 rounded border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition text-base font-medium shadow md:hidden"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Index;
