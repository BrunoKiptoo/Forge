import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <main className="overflow-x-hidden">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
