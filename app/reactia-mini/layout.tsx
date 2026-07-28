import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Every screen in the funnel shares this frame: grain overlay, navbar, a
 * flex-1 main so short screens still push the footer to the bottom, footer.
 */
export default function ReactiaMiniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="ds-grain" aria-hidden />
      <Navbar />
      <main className="mt-16 flex flex-1 flex-col pb-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
