import Header from "@/components/public/layout/Header";
import Footer from "@/components/public/layout/Footer";
import ChatWidget from "@/components/public/layout/ChatWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      {/*<ChatWidget />*/}
    </>
  );
}
