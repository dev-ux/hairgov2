import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import './Home.scss';

const Home = () => {
  return (
    <div className="home">
      <Header />
      <main>
        <Hero />
        <Features id="features" />
        <HowItWorks id="how-it-works" />
        <Testimonials id="testimonials" />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
