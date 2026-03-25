import { Link } from "wouter";
import { AmbientBackground } from "@/components/ambient-background";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <AmbientBackground />
      <main className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="glass-panel p-10 md:p-16 rounded-3xl text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border border-border/50 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <MapPinOff className="w-10 h-10 text-primary opacity-80" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display text-primary gold-text-glow mb-4">
            Kayıp Yol
          </h1>
          
          <p className="text-foreground/70 font-sans mb-8">
            Görünüşe göre yıldızlar sizi yanlış bir yöne yönlendirdi. Aradığınız sayfa burada bulunmuyor.
          </p>
          
          <Link href="/" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-primary/80 to-primary text-primary-foreground font-display tracking-widest text-sm uppercase hover:opacity-90 transition-opacity">
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </>
  );
}
