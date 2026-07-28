import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Every screen in the funnel shares this frame: navbar, a
 * flex-1 main so short screens still push the footer to the bottom, footer.
 */
export default function ReactiaMiniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* No horizontal padding here on purpose. The navbar and footer sit
          outside <main> and get their gutter from .ds-container, so padding on
          this element would stack on top of the container's and push the page
          content in further than the header — visible on mobile as a navbar
          that doesn't line up with the content below it. One gutter, one place. */}
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
