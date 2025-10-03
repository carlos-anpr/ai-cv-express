// components/header.tsx

"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

return (
<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
<nav className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl lg:px-8">
{/_ Logo _/}
<div className="flex lg:flex-1">
<a href="/" className="flex items-center gap-2 -m-1.5 p-1.5">
<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="6" fill="currentColor" />
<path d="M8 7H16V9H8V7ZM8 11H16V13H8V11ZM8 15H13V17H8V15Z" fill="black" />
</svg>
<span className="text-xl font-bold">CV Builder</span>
</a>
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
          <a href="#" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
            Características
          </a>
          <a href="#" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
            Plantillas
          </a>
          <a href="#" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
            Precios
          </a>
          <a href="#" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
            Ayuda
          </a>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          <a
            href="/auth/sign-in"
            className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            Iniciar sesión
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Comenzar
          </a>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 py-6 space-y-2 border-t border-border">
            <a
              href="#"
              className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Características
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Plantillas
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Precios
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Ayuda
            </a>
            <div className="pt-4 mt-4 space-y-2 border-t border-border">
              <a
                href="/auth/sign-in"
                className="block px-3 py-2 text-base font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Iniciar sesión
              </a>
              <a
                href="/dashboard"
                className="block px-3 py-2 text-base font-medium text-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Comenzar
              </a>
            </div>
          </div>
        </div>
      )}
    </header>

)
}

// page.tsx

import Header from "@/components/custom/Header"
import { Sparkles, FileText, Download, ArrowRight } from "lucide-react"

function Home() {
return (
<div className="min-h-screen bg-background">
<Header />

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 mx-auto max-w-7xl lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm border rounded-full border-border bg-secondary/50">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium">Nuevo</span>
            </span>
            <span className="w-px h-4 bg-border" />
            <span className="text-muted-foreground">Nuevas aplicaciones cada día</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance lg:text-7xl">
            La plataforma más rápida
            <br />
            para construir tu{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Currículum</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-white/10 -z-0" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto mb-10 text-lg leading-relaxed text-muted-foreground text-pretty lg:text-xl">
            Crea fácilmente un currículum destacado con nuestro generador potenciado por IA. Herramientas profesionales
            para destacar en tu búsqueda laboral.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium transition-all rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Comenzar
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium transition-all border rounded-lg border-border bg-secondary hover:bg-accent"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Ver vídeo
            </a>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-4 py-16 mx-auto border-t max-w-7xl lg:px-8 border-border">
        <div className="text-center">
          <p className="mb-12 text-sm font-medium tracking-wider uppercase text-muted-foreground">Destacado en</p>
          <div className="grid items-center grid-cols-2 gap-12 md:grid-cols-3 lg:grid-cols-5 opacity-60">
            {/* YouTube Logo */}
            <div className="flex items-center justify-center">
              <svg className="h-8" viewBox="0 0 132 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M39.4555 5.17846C38.9976 3.47767 37.6566 2.13667 35.9558 1.67876C32.8486 0.828369 20.4198 0.828369 20.4198 0.828369C20.4198 0.828369 7.99099 0.828369 4.88379 1.64606C3.21571 2.10396 1.842 3.47767 1.38409 5.17846C0.566406 8.28567 0.566406 14.729 0.566406 14.729C0.566406 14.729 0.566406 21.2051 1.38409 24.2796C1.842 25.9804 3.183 27.3214 4.88379 27.7793C8.0237 28.6297 20.4198 28.6297 20.4198 28.6297C20.4198 28.6297 32.8486 28.6297 35.9558 27.812C37.6566 27.3541 38.9976 26.0131 39.4555 24.3123C40.2732 21.2051 40.2732 14.7618 40.2732 14.7618C40.2732 14.7618 40.3059 8.28567 39.4555 5.17846Z"
                  fill="currentColor"
                />
                <path d="M16.4609 8.77612V20.6816L26.7966 14.7289L16.4609 8.77612Z" fill="white" />
              </svg>
            </div>

            {/* Product Hunt Logo */}
            <div className="flex items-center justify-center">
              <svg className="h-10" viewBox="0 0 208 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.7714 20.729C42.7714 31.9343 33.6867 41.019 22.4814 41.019C11.2747 41.019 2.19141 31.9343 2.19141 20.729C2.19141 9.52228 11.2754 0.438965 22.4814 0.438965C33.6867 0.438965 42.7714 9.52297 42.7714 20.729Z"
                  fill="currentColor"
                />
                <path
                  d="M25.1775 21.3312H20.1389V15.9959H25.1775C25.5278 15.9959 25.8747 16.0649 26.1983 16.1989C26.522 16.333 26.8161 16.5295 27.0638 16.7772C27.3115 17.0249 27.508 17.319 27.6421 17.6427C27.7761 17.9663 27.8451 18.3132 27.8451 18.6635C27.8451 19.0139 27.7761 19.3608 27.6421 19.6844C27.508 20.0081 27.3115 20.3021 27.0638 20.5499C26.8161 20.7976 26.522 20.9941 26.1983 21.1281C25.8747 21.2622 25.5278 21.3312 25.1775 21.3312ZM25.1775 12.439H16.582V30.2234H20.1389V24.8881H25.1775C28.6151 24.8881 31.402 22.1012 31.402 18.6635C31.402 15.2258 28.6151 12.439 25.1775 12.439Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Reddit Logo */}
            <div className="flex items-center justify-center">
              <svg className="h-10" viewBox="0 0 120 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.058 40.5994C31.0322 40.5994 39.9286 31.7031 39.9286 20.7289C39.9286 9.75473 31.0322 0.858398 20.058 0.858398C9.08385 0.858398 0.1875 9.75473 0.1875 20.7289C0.1875 31.7031 9.08385 40.5994 20.058 40.5994Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Additional placeholder logos */}
            <div className="flex items-center justify-center col-span-2 md:col-span-1">
              <div className="text-2xl font-bold tracking-tight">TechCrunch</div>
            </div>
            <div className="flex items-center justify-center col-span-2 md:col-span-1 lg:col-span-1">
              <div className="text-2xl font-bold tracking-tight">Forbes</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-32 mx-auto max-w-7xl lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">¿Cómo funciona?</h2>
          <p className="text-lg text-muted-foreground">Crea tu currículum en solo 3 sencillos pasos</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="relative p-8 transition-all border rounded-2xl border-border bg-card hover:border-white/20">
            <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-secondary">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Escribe la información de tu CV</h3>
            <p className="leading-relaxed text-muted-foreground">
              Añade el título del CV y selecciona tu puesto de trabajo preferido. Nuestra IA te guiará en el proceso.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 transition-all border rounded-2xl border-border bg-card hover:border-white/20">
            <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-secondary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Edita tu currículum</h3>
            <p className="leading-relaxed text-muted-foreground">
              Añade los detalles de tu perfil, como tu puesto y tu experiencia. Personaliza cada sección a tu gusto.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 transition-all border rounded-2xl border-border bg-card hover:border-white/20 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-secondary">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Comparte y descarga tu CV</h3>
            <p className="leading-relaxed text-muted-foreground">
              Comparte tu currículum con un enlace único y descárgalo en formato PDF listo para enviar.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/auth/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium transition-all rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Comienza hoy
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>

)
}

export default Home

// global.css

@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark \*));

:root {
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);
--secondary-foreground: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
--destructive: oklch(0.577 0.245 27.325);
--destructive-foreground: oklch(0.577 0.245 27.325);
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);
--chart-1: oklch(0.646 0.222 41.116);
--chart-2: oklch(0.6 0.118 184.704);
--chart-3: oklch(0.398 0.07 227.392);
--chart-4: oklch(0.828 0.189 84.429);
--chart-5: oklch(0.769 0.188 70.08);
--radius: 0.625rem;
--sidebar: oklch(0.985 0 0);
--sidebar-foreground: oklch(0.145 0 0);
--sidebar-primary: oklch(0.205 0 0);
--sidebar-primary-foreground: oklch(0.985 0 0);
--sidebar-accent: oklch(0.97 0 0);
--sidebar-accent-foreground: oklch(0.205 0 0);
--sidebar-border: oklch(0.922 0 0);
--sidebar-ring: oklch(0.708 0 0);
}

.dark {
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
--card: oklch(0.145 0 0);
--card-foreground: oklch(0.985 0 0);
--popover: oklch(0.145 0 0);
--popover-foreground: oklch(0.985 0 0);
--primary: oklch(0.985 0 0);
--primary-foreground: oklch(0.205 0 0);
--secondary: oklch(0.269 0 0);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.269 0 0);
--muted-foreground: oklch(0.708 0 0);
--accent: oklch(0.269 0 0);
--accent-foreground: oklch(0.985 0 0);
--destructive: oklch(0.396 0.141 25.723);
--destructive-foreground: oklch(0.637 0.237 25.331);
--border: oklch(0.269 0 0);
--input: oklch(0.269 0 0);
--ring: oklch(0.439 0 0);
--chart-1: oklch(0.488 0.243 264.376);
--chart-2: oklch(0.696 0.17 162.48);
--chart-3: oklch(0.769 0.188 70.08);
--chart-4: oklch(0.627 0.265 303.9);
--chart-5: oklch(0.645 0.246 16.439);
--sidebar: oklch(0.205 0 0);
--sidebar-foreground: oklch(0.985 0 0);
--sidebar-primary: oklch(0.488 0.243 264.376);
--sidebar-primary-foreground: oklch(0.985 0 0);
--sidebar-accent: oklch(0.269 0 0);
--sidebar-accent-foreground: oklch(0.985 0 0);
--sidebar-border: oklch(0.269 0 0);
--sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
/_ optional: --font-sans, --font-serif, --font-mono if they are applied in the layout.tsx _/
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-card: var(--card);
--color-card-foreground: var(--card-foreground);
--color-popover: var(--popover);
--color-popover-foreground: var(--popover-foreground);
--color-primary: var(--primary);
--color-primary-foreground: var(--primary-foreground);
--color-secondary: var(--secondary);
--color-secondary-foreground: var(--secondary-foreground);
--color-muted: var(--muted);
--color-muted-foreground: var(--muted-foreground);
--color-accent: var(--accent);
--color-accent-foreground: var(--accent-foreground);
--color-destructive: var(--destructive);
--color-destructive-foreground: var(--destructive-foreground);
--color-border: var(--border);
--color-input: var(--input);
--color-ring: var(--ring);
--color-chart-1: var(--chart-1);
--color-chart-2: var(--chart-2);
--color-chart-3: var(--chart-3);
--color-chart-4: var(--chart-4);
--color-chart-5: var(--chart-5);
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
--color-sidebar: var(--sidebar);
--color-sidebar-foreground: var(--sidebar-foreground);
--color-sidebar-primary: var(--sidebar-primary);
--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
--color-sidebar-accent: var(--sidebar-accent);
--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
--color-sidebar-border: var(--sidebar-border);
--color-sidebar-ring: var(--sidebar-ring);
}

@layer base {

- {
  @apply border-border outline-ring/50;
  }
  body {
  @apply bg-background text-foreground;
  }
  }
