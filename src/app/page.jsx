import Hero from '../components/Hero';
import About from '../components/About';
import Menu from '../components/Menu';
import Gallery from '../components/Gallery';
import WhyChooseUs from '../components/WhyChooseUs';
import PromoVideo from '../components/PromoVideo';
import Reviews from '../components/Reviews';
import Reservation from '../components/Reservation';
import Contact from '../components/Contact';
import ShortsSection from '../components/ShortsSection';
import BlogSection from '../components/BlogSection';

export default function HomePage() {
  return (
    <>
      {/* Welcome Banner */}
      <section id="home">
        <Hero />
      </section>

      {/* About Section */}
      <section id="about">
        <About />
      </section>

      {/* Why Choose Us */}
      <section id="why-us">
        <WhyChooseUs />
      </section>

      {/* YouTube Shorts Gallery */}
      <ShortsSection />

      {/* Menu Highlights Section */}
      <section id="menu">
        <Menu />
      </section>

      {/* Video Showcase & Stats Count Panel */}
      <PromoVideo />

      {/* Testimonials Carousel */}
      <section id="reviews">
        <Reviews />
      </section>

      {/* Visual Photo Gallery */}
      <section id="gallery">
        <Gallery />
      </section>

      {/* Reservation Panel */}
      <section id="reserve">
        <Reservation />
      </section>

      {/* Blog / Culinary Stories Section */}
      <BlogSection />

      {/* Contact Panel */}
      <section id="contact">
        <Contact />
      </section>
    </>
  );
}
