import Header from '@/components/custom/Header';
import {
  Sparkles,
  FileText,
  Download,
  ArrowRight,
  Zap,
  Palette,
  Globe,
  Shield,
  RefreshCw,
  Star,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

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
            <span className="text-muted-foreground">
              Nuevas aplicaciones cada día
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance lg:text-7xl">
            La plataforma más rápida
            <br />
            para construir tu{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Currículum</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -z-0" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto mb-10 text-lg leading-relaxed text-muted-foreground text-pretty lg:text-xl">
            Crea fácilmente un currículum destacado con nuestro generador
            potenciado por IA. Herramientas profesionales para destacar en tu
            búsqueda laboral.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium transition-all rounded-lg bg-black text-white hover:bg-black/90 animate-breathe"
            >
              Comenzar
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium transition-all border rounded-lg border-border bg-secondary hover:bg-accent"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
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
          <p className="mb-12 text-sm font-medium tracking-wider uppercase text-muted-foreground">
            Destacado en
          </p>
          <div className="grid items-center grid-cols-2 gap-12 md:grid-cols-3 lg:grid-cols-5 opacity-60">
            {/* YouTube Logo */}
            <div className="flex items-center justify-center">
              <svg
                className="h-8"
                viewBox="0 0 132 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M39.4555 5.17846C38.9976 3.47767 37.6566 2.13667 35.9558 1.67876C32.8486 0.828369 20.4198 0.828369 20.4198 0.828369C20.4198 0.828369 7.99099 0.828369 4.88379 1.64606C3.21571 2.10396 1.842 3.47767 1.38409 5.17846C0.566406 8.28567 0.566406 14.729 0.566406 14.729C0.566406 14.729 0.566406 21.2051 1.38409 24.2796C1.842 25.9804 3.183 27.3214 4.88379 27.7793C8.0237 28.6297 20.4198 28.6297 20.4198 28.6297C20.4198 28.6297 32.8486 28.6297 35.9558 27.812C37.6566 27.3541 38.9976 26.0131 39.4555 24.3123C40.2732 21.2051 40.2732 14.7618 40.2732 14.7618C40.2732 14.7618 40.3059 8.28567 39.4555 5.17846Z"
                  fill="currentColor"
                />
                <path
                  d="M16.4609 8.77612V20.6816L26.7966 14.7289L16.4609 8.77612Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Product Hunt Logo */}
            <div className="flex items-center justify-center">
              <svg
                className="h-10"
                viewBox="0 0 208 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
              <svg
                className="h-10"
                viewBox="0 0 120 41"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.058 40.5994C31.0322 40.5994 39.9286 31.7031 39.9286 20.7289C39.9286 9.75473 31.0322 0.858398 20.058 0.858398C9.08385 0.858398 0.1875 9.75473 0.1875 20.7289C0.1875 31.7031 9.08385 40.5994 20.058 40.5994Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Additional placeholder logos */}
            <div className="flex items-center justify-center col-span-2 md:col-span-1">
              <div className="text-2xl font-bold tracking-tight">
                TechCrunch
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2 md:col-span-1 lg:col-span-1">
              <div className="text-2xl font-bold tracking-tight">Forbes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="px-4 py-32 mx-auto max-w-7xl lg:px-8 bg-secondary/30"
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
            Potencia tu búsqueda laboral
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Herramientas profesionales impulsadas por IA para destacar entre la
            competencia
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Zap className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">IA Generativa</h3>
            <p className="leading-relaxed text-muted-foreground">
              Crea contenido profesional instantáneamente con nuestra IA
              avanzada. Genera descripciones, habilidades y experiencias
              optimizadas.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Palette className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Diseños Modernos</h3>
            <p className="leading-relaxed text-muted-foreground">
              Múltiples plantillas profesionales y personalizables. Cambia
              colores, fuentes y estilos para reflejar tu personalidad.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Globe className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Comparte en Línea</h3>
            <p className="leading-relaxed text-muted-foreground">
              Obtén un enlace único para compartir tu CV. Actualízalo en tiempo
              real y los reclutadores siempre verán la última versión.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Download className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Exportación PDF</h3>
            <p className="leading-relaxed text-muted-foreground">
              Descarga tu currículum en formato PDF de alta calidad, listo para
              imprimir o enviar por email. Compatible con ATS.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <RefreshCw
                className="w-5 h-5 text-foreground"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Actualización Rápida</h3>
            <p className="leading-relaxed text-muted-foreground">
              Modifica y actualiza tu CV en segundos. Los cambios se reflejan
              instantáneamente en tiempo real.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group relative p-8 transition-all duration-300 border rounded-2xl border-border bg-background hover:border-black/20 hover:shadow-lg">
            <div className="inline-flex items-center justify-center mb-6 p-2.5 rounded-xl bg-secondary transition-colors group-hover:bg-black/5">
              <Star className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Optimizado ATS</h3>
            <p className="leading-relaxed text-muted-foreground">
              Currículums optimizados para sistemas de seguimiento de
              candidatos. Aumenta tus posibilidades de ser seleccionado.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="px-4 py-32 mx-auto max-w-7xl lg:px-8"
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
            ¿Cómo funciona?
          </h2>
          <p className="text-lg text-muted-foreground">
            Crea tu currículum en solo 3 sencillos pasos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="relative p-8 transition-all border rounded-2xl border-border bg-card hover:border-primary/20">
            <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-secondary">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">
              Escribe la información de tu CV
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Añade el título del CV y selecciona tu puesto de trabajo
              preferido. Nuestra IA te guiará en el proceso.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 transition-all border rounded-2xl border-border bg-card hover:border-primary/20">
            <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-secondary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Edita tu currículum</h3>
            <p className="leading-relaxed text-muted-foreground">
              Añade los detalles de tu perfil, como tu puesto y tu experiencia.
              Personaliza cada sección a tu gusto.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 transition-all border rounded-2xl border-border bg-card hover:border-primary/20 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-secondary">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">
              Comparte y descarga tu CV
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Comparte tu currículum con un enlace único y descárgalo en formato
              PDF listo para enviar.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/auth/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium transition-all rounded-lg bg-black text-white hover:bg-black/90 animate-breathe"
          >
            Comienza hoy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
