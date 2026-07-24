/**
 * Landing Page — Public SaaS marketing page with lead capture form.
 * Sections: Hero, Animated Counters, Features, About, Contact Form.
 */

import { useState, useEffect } from 'react';
import LeadForm from '../components/LeadForm';
import AnimatedCounter from '../components/AnimatedCounter';
import { getPublicStatsAPI } from '../services/api';

const FEATURES = [
  {
    icon: '🚀',
    title: 'Lightning Fast',
    description: 'Capture and manage leads in real-time with instant dashboard updates and notifications.',
  },
  {
    icon: '🔒',
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with JWT authentication, bcrypt hashing, and encrypted connections.',
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    description: 'Track lead status, filter by budget, and get actionable insights with dashboard statistics.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description: 'Manage your leads on any device — desktop, tablet, or mobile with our adaptive design.',
  },
];

function LandingPage() {
  const [stats, setStats] = useState([
    { end: 0, suffix: '', label: 'Businesses Helped' },
    { end: 100, suffix: '%', label: 'Customer Satisfaction' },
    { end: 0, suffix: 'hrs', label: 'Average Response Time' },
    { end: 0, suffix: '', label: 'Leads Captured' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPublicStatsAPI();
        setStats([
          { end: data.businesses_helped || 0, suffix: '', label: 'Businesses Helped' },
          { end: 100, suffix: '%', label: 'Customer Satisfaction' },
          { end: 1, suffix: 'hr', label: 'Average Response Time' },
          { end: data.leads_captured || 0, suffix: '', label: 'Leads Captured' },
        ]);
      } catch (error) {
        console.error('Failed to fetch public stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden">
        <div className="gradient-bg absolute inset-0 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZWMGM0LTMuMzE0IDAtNi0yLjY4Ni02LTZzMi42ODYtNiA2LTZjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              Now accepting new clients
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Capture Leads.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-300">
                Close Deals.
              </span>
              <br />
              Grow Business.
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              LeadDesk Mini helps you capture, manage, and convert leads with a modern
              dashboard. Built for teams that move fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <a
                href="#contact"
                className="px-8 py-4 rounded-xl bg-white text-primary font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free →
              </a>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-white dark:fill-surface-dark"
            />
          </svg>
        </div>
      </section>

      {/* Animated Counters Section */}
      <section className="py-16 bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} duration={2000 + i * 200} />
                </div>
                <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              Everything you need to capture and manage leads efficiently.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-surface-card-dark rounded-2xl p-6 border border-border dark:border-border-dark hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-text-dark-primary mb-6">
                Built for Modern
                <span className="text-primary"> Sales Teams</span>
              </h2>
              <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed mb-6">
                LeadDesk Mini is a full-stack lead management platform designed to streamline
                your sales pipeline. From capturing leads on your landing page to tracking
                their journey through your admin dashboard — everything in one place.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time lead capture with instant notifications',
                  'Admin dashboard with search, filter & status management',
                  'Secure JWT authentication & role-based access',
                  'Responsive design for any device',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-sm text-text-primary dark:text-text-dark-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-border dark:border-border-dark">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-surface-card-dark rounded-xl p-5 text-center border border-border dark:border-border-dark">
                  <div className="text-2xl font-bold text-primary mb-1">React 19</div>
                  <div className="text-xs text-text-secondary dark:text-text-dark-secondary">Frontend</div>
                </div>
                <div className="bg-white dark:bg-surface-card-dark rounded-xl p-5 text-center border border-border dark:border-border-dark">
                  <div className="text-2xl font-bold text-emerald-500 mb-1">FastAPI</div>
                  <div className="text-xs text-text-secondary dark:text-text-dark-secondary">Backend</div>
                </div>
                <div className="bg-white dark:bg-surface-card-dark rounded-xl p-5 text-center border border-border dark:border-border-dark">
                  <div className="text-2xl font-bold text-green-500 mb-1">MongoDB</div>
                  <div className="text-xs text-text-secondary dark:text-text-dark-secondary">Database</div>
                </div>
                <div className="bg-white dark:bg-surface-card-dark rounded-xl p-5 text-center border border-border dark:border-border-dark">
                  <div className="text-2xl font-bold text-amber-500 mb-1">JWT</div>
                  <div className="text-xs text-text-secondary dark:text-text-dark-secondary">Auth</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Lead Form Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-text-secondary dark:text-text-dark-secondary">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>
            <div className="bg-white dark:bg-surface-card-dark rounded-2xl p-8 border border-border dark:border-border-dark shadow-lg">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
