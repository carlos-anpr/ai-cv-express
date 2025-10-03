import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AddExpressCard Component
 *
 * Card destacada en el Dashboard para iniciar Generación Express
 */

const AddExpressCard = ({ className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard/express');
  };

  return (
    <Card
      className={cn(
        'col-span-full lg:col-span-2 relative overflow-hidden cursor-pointer group',
        'border-primary/30 hover:border-primary/50 transition-all duration-300',
        'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
        'hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={handleClick}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />

      {/* Animated sparkles background */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <Sparkles className="w-24 h-24 text-primary animate-pulse" />
      </div>

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              <Zap className="w-3 h-3" />
              NUEVO
            </div>

            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-7 h-7 text-primary" />
              Generación Express
            </h3>

            <p className="text-muted-foreground text-base">
              Crea tu CV completo en solo{' '}
              <span className="font-bold text-primary">5 minutos</span> con IA
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FeatureItem icon={CheckCircle2} text="CV personalizado al puesto" />
          <FeatureItem
            icon={CheckCircle2}
            text="Carta de presentación incluida"
          />
          <FeatureItem
            icon={CheckCircle2}
            text="Candidatura lista para enviar"
          />
          <FeatureItem icon={CheckCircle2} text="100% editable después" />
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full group relative overflow-hidden"
          onClick={handleClick}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 group-hover:from-primary/90 group-hover:to-primary transition-all" />

          <span className="relative flex items-center justify-center gap-2 text-base font-semibold">
            Comenzar Ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>

        {/* Info text */}
        <p className="text-xs text-center text-muted-foreground">
          🎯 Solo necesitas describir tu perfil y pegar la oferta de trabajo
        </p>
      </CardContent>
    </Card>
  );
};

// Feature item component
// eslint-disable-next-line no-unused-vars
const FeatureItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm">
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
      <Icon className="w-3 h-3 text-primary" />
    </div>
    <span className="text-muted-foreground font-medium">{text}</span>
  </div>
);

export default AddExpressCard;
