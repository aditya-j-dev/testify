import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-testify-bg py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-testify-surface border border-testify-border text-testify-text font-serif italic text-xs font-bold">
            T
          </div>
          <span className="font-serif text-lg font-bold text-testify-text tracking-tight">Testify</span>
        </Link>
        
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-testify-muted">
          <Link href="/privacy" className="hover:text-testify-text transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-testify-text transition-colors">Terms</Link>
          <Link href="/security" className="hover:text-testify-text transition-colors">Security</Link>
          <Link href="/docs" className="hover:text-testify-text transition-colors">Docs</Link>
          <Link href="/support" className="hover:text-testify-text transition-colors">Support</Link>
        </div>
        
        {/* Copyright */}
        <div className="text-xs text-testify-muted2 font-mono">
          © {new Date().getFullYear()} Testify Platform.
        </div>
      </div>
    </footer>
  );
}
