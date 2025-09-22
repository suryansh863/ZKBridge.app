"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, Wallet, Settings, User } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300",
      "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
      "border-white/10 dark:border-white/5"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl gradient-bridge flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-lg">ZK</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            ZKBridge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className={cn(
            "relative text-foreground/60 hover:text-foreground transition-all duration-300",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500",
            "hover:after:w-full after:transition-all after:duration-300",
            pathname === "/" && "text-foreground after:w-full"
          )}>
            Home
          </Link>
          <Link href="/bridge" className={cn(
            "relative text-foreground/60 hover:text-foreground transition-all duration-300",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500",
            "hover:after:w-full after:transition-all after:duration-300",
            pathname === "/bridge" && "text-foreground after:w-full"
          )}>
            Bridge
          </Link>
          <Link href="/transactions" className={cn(
            "relative text-foreground/60 hover:text-foreground transition-all duration-300",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500",
            "hover:after:w-full after:transition-all after:duration-300",
            pathname === "/transactions" && "text-foreground after:w-full"
          )}>
            Transactions
          </Link>
          <Link href="/docs" className={cn(
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
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>
          
          <ConnectButton
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            chainStatus="icon"
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
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
                href="/" 
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
                href="/bridge" 
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
                href="/transactions" 
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
                href="/docs" 
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
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-600" />
                  )}
                </button>
              </div>
              
              <div className="w-full">
                <ConnectButton
                  accountStatus="avatar"
                  chainStatus="icon"
                  showBalance={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
