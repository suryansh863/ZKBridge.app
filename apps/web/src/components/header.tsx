import { useState, Suspense, lazy } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/client-only';

const WalletConnectionSection = lazy(() => import('./wallet-sections').then(mod => ({ default: mod.WalletConnectionSection })))
const MobileWalletConnectionSection = lazy(() => import('./wallet-sections').then(mod => ({ default: mod.MobileWalletConnectionSection })))


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300",
      "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
      "border-white/10 dark:border-white/5"
    )}>
      <div className="container px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl gradient-bridge flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-lg">BS</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            BridgeSpark
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={cn(
            "relative text-foreground/60 hover:text-foreground transition-all duration-300",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500",
            "hover:after:w-full after:transition-all after:duration-300",
            pathname === "/" && "text-foreground after:w-full"
          )}>
            Home
          </Link>
          <Link to="/bridge" className={cn(
            "relative text-foreground/60 hover:text-foreground transition-all duration-300",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500",
            "hover:after:w-full after:transition-all after:duration-300",
            pathname === "/bridge" && "text-foreground after:w-full"
          )}>
            Bridge
          </Link>
          <Link to="/transactions" className={cn(
            "relative text-foreground/60 hover:text-foreground transition-all duration-300",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500",
            "hover:after:w-full after:transition-all after:duration-300",
            pathname === "/transactions" && "text-foreground after:w-full"
          )}>
            Transactions
          </Link>
          <Link to="/docs" className={cn(
            "relative text-foreground/60 hover:text-foreground transition-all duration-300",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500",
            "hover:after:w-full after:transition-all after:duration-300",
            pathname === "/docs" && "text-foreground after:w-full"
          )}>
            Docs
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg transition-all duration-300",
              "hover:bg-muted/50 hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 text-yellow-500 dark:block hidden" />
            <Moon className="h-5 w-5 text-slate-600 dark:hidden block" />
          </button>

          {/* Multi-Wallet Connect Button */}
          <Suspense fallback={<div className="h-10 w-32 bg-muted/20 animate-pulse rounded-lg" />}>
            <WalletConnectionSection />
          </Suspense>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={cn(
            "md:hidden p-2 rounded-lg transition-all duration-300",
            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={cn(
          "md:hidden border-t transition-all duration-300",
          "bg-background/95 backdrop-blur-xl",
          "border-white/10 dark:border-white/5"
        )}>
          <div className="container py-6 space-y-6">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className={cn(
                  "text-foreground/60 hover:text-foreground transition-all duration-300",
                  "py-2 px-4 rounded-lg hover:bg-muted/50",
                  pathname === "/" && "text-foreground bg-muted/30"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/bridge"
                className={cn(
                  "text-foreground/60 hover:text-foreground transition-all duration-300",
                  "py-2 px-4 rounded-lg hover:bg-muted/50",
                  pathname === "/bridge" && "text-foreground bg-muted/30"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Bridge
              </Link>
              <Link
                to="/transactions"
                className={cn(
                  "text-foreground/60 hover:text-foreground transition-all duration-300",
                  "py-2 px-4 rounded-lg hover:bg-muted/50",
                  pathname === "/transactions" && "text-foreground bg-muted/30"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Transactions
              </Link>
              <Link
                to="/docs"
                className={cn(
                  "text-foreground/60 hover:text-foreground transition-all duration-300",
                  "py-2 px-4 rounded-lg hover:bg-muted/50",
                  pathname === "/docs" && "text-foreground bg-muted/30"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </Link>
            </nav>

            <div className="flex flex-col space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/70">Theme</span>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    "hover:bg-muted/50 hover:scale-105"
                  )}
                  aria-label="Toggle theme"
                >
                  <Sun className="h-5 w-5 text-yellow-500 dark:block hidden" />
                  <Moon className="h-5 w-5 text-slate-600 dark:hidden block" />
                </button>
              </div>

              <div className="w-full">
                <Suspense fallback={<div className="h-12 w-full bg-muted/20 animate-pulse rounded-lg" />}>
                  <MobileWalletConnectionSection />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
