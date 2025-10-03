import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Menu, X } from 'lucide-react';

function Header() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="flex items-center gap-2 -m-1.5 p-1.5">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">CV</span>
            </div>
            <span className="text-xl font-bold">CV Builder</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 -m-2.5 rounded-md text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Abrir menú principal</span>
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          <a
            href="#features"
            className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            Características
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            ¿Cómo funciona?
          </a>
          <a
            href="#"
            className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            Ayuda
          </a>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          {isSignedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-sm font-medium">
                  Panel
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link to="/auth/sign-in">
                <Button variant="ghost" className="text-sm font-medium">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="text-sm font-medium bg-black text-white hover:bg-black/90">
                  Comenzar
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 py-6 space-y-2 border-t border-border">
            <a
              href="#features"
              className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Características
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              ¿Cómo funciona?
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ayuda
            </a>
            <div className="pt-4 mt-4 space-y-2 border-t border-border">
              {isSignedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      Panel
                    </Button>
                  </Link>
                  <div className="px-3 py-2">
                    <UserButton />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full">
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-black text-white hover:bg-black/90">
                      Comenzar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
