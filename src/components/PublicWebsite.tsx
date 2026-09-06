import React, { useState } from 'react';
import { 
  Heart, 
  Star, 
  Sparkles, 
  UserCheck, 
  Camera, 
  Calendar, 
  Instagram, 
  MessageCircle, 
  Menu, 
  X, 
  ExternalLink, 
  Puzzle,
  Lock,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PublicWebsiteProps {
  onOpenApp: () => void;
  onOpenAuthModal: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ onOpenApp, onOpenAuthModal }) => {
  const { user, systemUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleAreaDoIanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user || systemUser) {
      onOpenApp();
    } else {
      onOpenAuthModal();
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-blue selection:text-white font-sans bg-brand-warm/10 overflow-x-hidden text-slate-800">
      {/* Header / Navigation */}
      <header id="main-header" className="relative z-40 transition-all duration-300 py-6 px-4 md:px-6">
        <nav className="mx-auto max-w-7xl flex items-center justify-between glass-nav rounded-[2rem] px-6 py-3 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full p-1 shadow-md border-2 border-sky-200 overflow-hidden relative group cursor-pointer">
              <div className="relative w-full h-full overflow-hidden rounded-full">
                {/* Photo 1: Sem Colar */}
                <img 
                  src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/iansemcolar.png"
                  alt="Ian"
                  className="absolute inset-0 w-full h-full object-cover object-center rounded-full scale-125 transition-opacity duration-300 group-hover:opacity-0"
                />
                {/* Photo 2: Com Colar */}
                <img 
                  src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/iancomcolar.png"
                  alt="Ian com Colar"
                  className="absolute inset-0 w-full h-full object-cover object-center rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-y-0"
                />
              </div>
            </div>
            <div>
              <span className="font-kids text-2xl font-black text-brand-blue-dark tracking-tight">Mundo Azul</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-bold text-sky-600 bg-sky-100/80 px-2 py-0.5 rounded-full">do Ian</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-600 font-kids">
            <a href="#inicio" className="hover:text-brand-blue transition-colors">Início</a>
            <a href="#sobre" className="hover:text-brand-blue transition-colors">História</a>
            <a href="#album-evolucao" className="hover:text-brand-blue transition-colors">Fotos</a>
            <a href="#profissionais" className="hover:text-brand-blue transition-colors text-brand-blue-dark bg-brand-blue-light/60 px-3 py-1 rounded-full">
              Profissionais (5)
            </a>
            <a href="#recursos" className="hover:text-brand-blue transition-colors">Dicas</a>
            
            {/* AREA DO IAN BUTTON */}
            <button 
              onClick={handleAreaDoIanClick}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-sky-500/30 transition-all hover:scale-105 cursor-pointer font-kids"
            >
              <Lock className="w-4 h-4" />
              <span>{user || systemUser ? 'Área do Ian (Entrar)' : 'Área do Ian'}</span>
              {(user || systemUser) && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              )}
            </button>

            <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
              <a 
                href="https://instagram.com/ianzinhopaterraoficial" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-brand-blue transition-colors p-1"
                title="Instagram do Ian"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-green-500 transition-colors p-1"
                title="Contato WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>

            <button 
              onClick={onOpenAuthModal}
              className="blob-button bg-brand-blue text-white hover:bg-brand-blue-dark !py-2 !px-5 shadow-brand-blue/20 text-xs"
            >
              {user || systemUser ? 'Minha Conta' : 'Login / Registro'}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-brand-blue transition-colors"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl border border-brand-blue/10 animate-fadeIn">
            <div className="flex flex-col gap-4 text-center font-kids text-lg font-bold">
              <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-brand-blue py-1">Início</a>
              <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-brand-blue py-1">Nossa História</a>
              <a href="#album-evolucao" onClick={() => setMobileMenuOpen(false)} className="text-pink-600 bg-pink-50 p-2 rounded-xl flex items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-pink-500" /> Álbum de Conquistas
              </a>
              <a href="#profissionais" onClick={() => setMobileMenuOpen(false)} className="text-brand-blue-dark py-1">Profissionais do Ian (5)</a>
              <a href="#recursos" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-brand-blue py-1">Dicas sobre TEA</a>
              
              <button 
                onClick={(e) => { setMobileMenuOpen(false); handleAreaDoIanClick(e); }}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-md"
              >
                <Lock className="w-5 h-5" />
                <span>🔐 Acessar Área do Ian</span>
              </button>

              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenAuthModal(); }}
                className="blob-button bg-brand-blue text-white w-full !py-2.5"
              >
                {user || systemUser ? 'Ver Meu Perfil' : 'Entrar / Cadastro'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-[90vh] flex items-center pt-16 pb-16 px-4 md:px-6 overflow-hidden bg-brand-blue-light/30">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="relative mb-10">
              <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
                <div className="absolute inset-0 bg-brand-blue rounded-full animate-ping opacity-15"></div>
                <div className="absolute -inset-4 bg-gradient-to-tr from-brand-blue via-brand-yellow to-brand-pink rounded-full p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-full p-2 overflow-hidden shadow-inner">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover object-center rounded-full scale-125"
                    >
                      <source src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/09/Boy_speaking_to_camera_202609012156.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg border-4 border-white transform rotate-6 animate-float">
                  <Star className="w-8 h-8 text-orange-500 fill-orange-500" />
                </div>
                <div className="absolute -bottom-2 -left-4 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <Heart className="w-6 h-6 text-[#5a8cd7] fill-[#5a8cd7]" />
                </div>
              </div>
            </div>

            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm text-brand-blue-dark font-kids font-bold text-sm mb-6 border border-brand-blue/15">
                <Sparkles className="w-[18px] h-[18px] text-brand-yellow fill-brand-yellow" /> 
                ESPAÇO DEDICADO AO IANZINHO
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 text-slate-900 leading-tight font-kids tracking-tight">
                Conheça o Mundo <span className="text-brand-blue underline decoration-brand-yellow decoration-8 underline-offset-8">através</span> dos olhos do Ian.
              </h1>
              <p className="text-lg md:text-2xl text-slate-600 mb-8 leading-relaxed font-medium max-w-2xl mx-auto italic">
                Cada criança tem seu tempo. Cada conquista merece ser celebrada. Este espaço nasceu para compartilhar a jornada do Ian, conscientizar sobre o autismo e acolher outras famílias.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="#sobre" 
                  className="blob-button bg-brand-blue text-white py-4 px-8 shadow-lg shadow-brand-blue/30 w-full sm:w-auto"
                >
                  💙 A História do Ianzinho <Heart className="w-5 h-5 fill-white ml-1" />
                </a>
                
                <button
                  onClick={handleAreaDoIanClick}
                  className="blob-button bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white py-4 px-8 shadow-lg shadow-indigo-500/30 w-full sm:w-auto hover:scale-105"
                >
                  <Lock className="w-5 h-5 mr-1" /> 
                  <span>{user || systemUser ? 'Acessar Central de Acompanhamento' : 'Área Restrita do Ian'}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <a 
                  href="#profissionais" 
                  className="blob-button bg-white text-slate-700 border-2 border-slate-200 py-4 px-8 hover:border-brand-yellow transition-all w-full sm:w-auto"
                >
                  Profissionais <UserCheck className="w-5 h-5 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="sobre" className="py-24 px-4 md:px-6 bg-brand-warm/40 overflow-hidden">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative p-4">
            <div className="aspect-square rounded-[3.5rem] overflow-hidden bg-white shadow-2xl relative border-4 border-white transition-transform duration-500 hover:scale-[1.02]">
              <img 
                src="https://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/ianfone.png" 
                alt="História do meu pequeno - Autismo" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 bg-brand-pink text-pink-800 rounded-full font-bold text-xs uppercase tracking-widest font-kids">
              Nossa História
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-kids text-slate-900 leading-tight">
              O que aprendemos com o <span className="text-brand-blue">nosso herói</span>.
            </h2>
            <div className="space-y-5 text-base md:text-lg text-slate-600 font-medium leading-relaxed">
              <p>
                Em maio de 2023, nossas vidas mudaram para sempre com a chegada do Ian, filho de Marcos e Alessandra. Desde o primeiro dia, ele trouxe um amor impossível de descrever e mostrou que cada criança tem sua própria maneira de enxergar e sentir o mundo.
              </p>
              <p>
                Quando o Ian completou 1 ano de idade, em 2024, Marcos e Alessandra receberam o diagnóstico de Transtorno do Espectro Autista (TEA), com nível de suporte, realizado pela <strong>Dra. Karen Camargo</strong>. Desde então, iniciaram uma jornada de aprendizado, amor e dedicação, buscando oferecer ao Ian todo o apoio necessário para seu desenvolvimento, respeitando seu tempo, suas características e suas conquistas.
              </p>
              
              <div className="flex items-start gap-4 p-5 bg-white rounded-[2rem] border-2 border-brand-yellow/50 shadow-sm relative">
                <Heart className="text-brand-blue shrink-0 animate-bounce w-7 h-7 fill-[#38bdf8] mt-1" />
                <p className="text-brand-blue-dark font-bold italic font-kids text-lg">
                  "Não é sobre cura, é sobre amor, paciência e aceitação total."
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAreaDoIanClick}
                  className="inline-flex items-center gap-2 text-sm font-bold font-kids text-sky-600 hover:text-sky-800 hover:underline"
                >
                  <Activity className="w-4 h-4" />
                  <span>Ver prontuário e evolução completa na Área do Ian →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Álbum de Fotos das Evoluções do Ian */}
      <section id="album-evolucao" className="py-24 px-4 md:px-6 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-100 text-pink-700 font-kids text-sm font-bold mb-4 border border-pink-200 shadow-sm">
              <Camera className="w-4 h-4 text-pink-500" /> ÁLBUM DE EVOLUÇÃO & CONQUISTAS
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-kids text-slate-900 leading-tight">
              As <span className="text-brand-blue">Conquistas</span> do Ian
            </h2>
            <p className="text-slate-600 font-medium text-base md:text-lg mt-3">
              Cada imagem registra uma barreira superada, um novo sorriso e um grande avanço no desenvolvimento.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Foto 1 */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4 border-2 border-slate-100 shadow-inner">
                  <img 
                    src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/IMG-20230801-WA0157-e1785031443739.jpg"
                    alt="Primeiro mês de vida do Ian"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-yellow" /> Agosto 2023
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black font-kids text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ★ 01 mês
                  </span>
                </div>
                <h3 className="text-xl font-black font-kids text-slate-900 mb-2">Meu Primeiro Mês de Vida</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  "1º mês de vida: Os primeiros dias de uma história de amor, descobertas e muitas conquistas que estavam por vir. 💙"
                </p>
              </div>
            </div>

            {/* Foto 2 */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4 border-2 border-slate-100 shadow-inner">
                  <img 
                    src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/IMG-20240210-WA0051.jpg" 
                    alt="Pintura e Arte" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-yellow" /> Fevereiro 2024
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black font-kids text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    ★ Sensorial
                  </span>
                </div>
                <h3 className="text-xl font-black font-kids text-slate-900 mb-2">Expressão Artística</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  "Dos 0 aos 8 meses e 10 dias de vida, Ian viveu seus primeiros momentos de descobertas, crescimento e desenvolvimento, iniciando uma linda jornada que transformaria a vida de toda a família. 💙"
                </p>
              </div>
            </div>

            {/* Foto 3 */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4 border-2 border-slate-100 shadow-inner">
                  <img 
                    src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/Screenshot_2024-08-04-18-05-40-458_com.miui_.gallery-edit.jpg" 
                    alt="Quebra Cabeça" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-yellow" /> Janeiro 2025
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black font-kids text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ★ Grande Conquista
                  </span>
                </div>
                <h3 className="text-xl font-black font-kids text-slate-900 mb-2">👦 1 ano e 7 meses</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  "Um grande passo: Cada sorriso, olhar e interação do Ian representou uma conquista inesquecível. Pequenos gestos que encheram nossos corações de esperança e mostraram que cada avanço tem um significado enorme. 💙"
                </p>
              </div>
            </div>

            {/* Foto 4 */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4 border-2 border-slate-100 shadow-inner">
                  <img 
                    src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/20251010_192034-scaled.jpg"
                    alt="No Parque"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-yellow" /> Outubro de 2025
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black font-kids text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Coordenação Motora
                  </span>
                  <span className="text-xs font-bold font-kids text-slate-400">2 anos e 4 meses</span>
                </div>
                <h3 className="text-xl font-black font-kids text-slate-900 mb-2">10 de outubro de 2025</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  "Pequenos movimentos, grandes conquistas: Cada passo, cada brincadeira e cada tentativa mostram a evolução do Ian e sua forma única de descobrir o mundo. 💙!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Profissionais do Ian */}
      <section id="profissionais" className="py-24 px-4 md:px-6 bg-brand-blue-light/25 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-brand-blue/10 rounded-full font-kids font-bold text-sm text-brand-blue-dark mb-4 border border-brand-blue/20">
              <UserCheck className="w-4 h-4" /> EQUIPE MULTIDISCIPLINAR DO IAN
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 font-kids text-slate-900 leading-tight">
              Os <span className="text-brand-blue">Profissionais</span> do Ian
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-medium text-base md:text-lg">
              Conheça os 5 especialistas que acompanham o desenvolvimento e bem-estar do nosso pequeno herói.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Profissional 1: Dra. Karen */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full font-kids bg-brand-blue-light text-brand-blue-dark">
                    Neuropediatra
                  </span>
                </div>
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/karen-1.jpg" 
                      alt="Dra. Karen Camargo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h3 className="text-xl font-black font-kids text-slate-900">Dra. Karen Camargo</h3>
                  <p className="text-brand-blue-dark font-bold font-kids text-xs mt-0.5">
                    Neurofisiologista • Autismo & ABA
                  </p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 font-medium text-center italic">
                  "A neuropediatra tem um papel essencial no acompanhamento do Ian, avaliando seu desenvolvimento neurológico e oferecendo orientações para apoiar cada etapa da sua evolução."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <a 
                  href="https://www.instagram.com/dra.karenpgcamargo?igsh=MWFxeDFxOHF0ejV0bA%3D%3D" 
                  target="_blank" 
                  rel="noreferrer"
                  className="blob-button bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white w-full !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Ver Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Profissional 2: Letícia Onari */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full font-kids bg-brand-yellow/50 text-amber-800">
                    Fonoaudióloga
                  </span>
                </div>
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/leticia-fono-1.jpg" 
                      alt="Letícia Onari" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h3 className="text-xl font-black font-kids text-slate-900">Letícia Onari</h3>
                  <p className="text-brand-blue-dark font-bold font-kids text-xs mt-0.5">Fonoaudióloga Infantil</p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 font-medium text-center italic">
                  "A fonoaudióloga tem um papel fundamental no desenvolvimento do Ian, auxiliando na comunicação, na linguagem e na expressão de suas emoções a cada dia."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <a 
                  href="https://www.instagram.com/fga.leticiaonari?igsh=Y3Z5cGhhb240YzZi" 
                  target="_blank" 
                  rel="noreferrer"
                  className="blob-button bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white w-full !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Ver Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Profissional 3: Edinéia Almeida */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full font-kids bg-brand-pink text-pink-800">
                    T.O. Sensorial
                  </span>
                </div>
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/edneia-TO-1.jpg" 
                      alt="Edinéia Almeida" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h3 className="text-xl font-black font-kids text-slate-900">Edinéia Almeida</h3>
                  <p className="text-brand-blue-dark font-bold font-kids text-xs mt-0.5">Terapeuta Ocupacional</p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 font-medium text-center italic">
                  "A terapeuta ocupacional tem um papel importante no desenvolvimento do Ian, trabalhando habilidades motoras, sensoriais e de autonomia para as atividades do dia a dia."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <a 
                  href="https://www.instagram.com/edineia_almeidaa_?igsh=MXg2YThmejJlZDRyYw%3D%3D" 
                  target="_blank" 
                  rel="noreferrer"
                  className="blob-button bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white w-full !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Ver Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Profissional 4: Barbara Momberg */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full font-kids bg-brand-mint text-teal-800">
                    Musicoterapia
                  </span>
                </div>
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/barbara-musiciterapia-1.jpg" 
                      alt="Barbara Momberg" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h3 className="text-xl font-black font-kids text-slate-900">Barbara Momberg</h3>
                  <p className="text-brand-blue-dark font-bold font-kids text-xs mt-0.5">Musicoterapeuta</p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 font-medium text-center italic">
                  "A musicoterapeuta tem um papel especial no desenvolvimento do Ian, utilizando a música como uma forma de comunicação, expressão e aprendizado."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <a 
                  href="https://www.instagram.com/mt.barbaramomberg?igsh=c2tjdzlhaXpodHI1" 
                  target="_blank" 
                  rel="noreferrer"
                  className="blob-button bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white w-full !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Ver Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Profissional 5: Marcelo Cardoso */}
            <div className="kid-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full font-kids bg-purple-100 text-purple-800">
                    Psicólogo ABA
                  </span>
                </div>
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/marcelo-psicologo-1.jpg" 
                      alt="Marcelo Cardoso" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h3 className="text-xl font-black font-kids text-slate-900">Marcelo Cardoso</h3>
                  <p className="text-brand-blue-dark font-bold font-kids text-xs mt-0.5">Psicólogo Comportamental</p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 font-medium text-center italic">
                  "O psicólogo tem um papel fundamental no desenvolvimento emocional, comportamental e cognitivo do Ian, auxiliando na construção da autonomia, da comunicação e das habilidades sociais."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <a 
                  href="https://www.instagram.com/drmarcelo_psicotea?igsh=c2puMXJ3cGZlaGJ2" 
                  target="_blank" 
                  rel="noreferrer"
                  className="blob-button bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white w-full !py-2.5 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Ver Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Central Call to Action for Multidisciplinary Platform */}
          <div className="mt-14 p-8 rounded-[2.5rem] bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold font-kids mb-2">
                <Shield className="w-3.5 h-3.5" /> PLATAFORMA INTEGRADA DE ACOMPANHAMENTO
              </div>
              <h3 className="text-2xl md:text-3xl font-black font-kids">
                Equipe & Família Conectadas em Tempo Real
              </h3>
              <p className="text-sky-100 text-sm mt-1 max-w-xl">
                Os 5 especialistas e os pais contam com prontuário clínico online, evolução de sessões, metas PEI, diário diário e comunicação com a escola.
              </p>
            </div>
            <button
              onClick={handleAreaDoIanClick}
              className="blob-button bg-white text-indigo-900 hover:bg-sky-50 font-bold text-sm shrink-0 shadow-lg"
            >
              <Lock className="w-4 h-4 mr-1 text-indigo-600" />
              <span>Acessar Prontuário do Ian</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section / Dicas */}
      <section id="recursos" className="py-24 px-4 md:px-6 bg-white relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 font-kids text-slate-900">
              Vamos brincar e <span className="text-brand-blue">aprender</span>?
            </h2>
            <p className="text-slate-500 font-medium">Informações úteis e acolhimento para famílias atípicas</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="kid-card">
              <h3 className="text-2xl font-black mb-3 font-kids text-slate-900">O que é o TEA?</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-sm">
                Transtorno do Espectro Autista, também conhecido como autismo. É uma condição de desenvolvimento do cérebro que muda o modo como a pessoa se desenvolve, conversa e se relaciona com os outros. A palavra "espectro" mostra que cada pessoa é única e pode ter sinais leves ou fortes.
              </p>
            </div>

            <div className="kid-card">
              <h3 className="text-2xl font-black mb-3 font-kids text-slate-900">Dicas de Estímulo</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-sm">
                <strong>Uso de imagens:</strong> Crie quadros de rotina com desenhos ou fotos para mostrar o que vai acontecer no dia.<br />
                <strong>Previsibilidade:</strong> Avise com antecedência se houver alguma mudança nos planos para evitar sustos ou crises.<br />
                <strong>Passos curtos:</strong> Divida grandes tarefas em pequenas partes simples de entender.
              </p>
            </div>

            <div className="kid-card">
              <h3 className="text-2xl font-black mb-3 font-kids text-slate-900">Rede de Carinho</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-sm">
                A Rede de Carinho orienta e acompanha pacientes e familiares, fortalecendo todos os processos de acolhimento, diagnóstico precoce e tratamento multidisciplinar do TEA com respeito e dignidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-12 px-4 md:px-6 bg-slate-900 text-white rounded-t-[3.5rem] relative overflow-hidden">
        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Puzzle className="text-brand-blue w-8 h-8" />
              <span className="font-kids text-3xl font-bold">Mundo Azul do Ian</span>
            </div>

            <div className="flex items-center gap-4 text-sm font-kids">
              <button 
                onClick={handleAreaDoIanClick}
                className="text-sky-400 hover:text-white transition-colors"
              >
                🔐 Área Restrita do Ian
              </button>
              <span className="text-slate-700">•</span>
              <a href="#inicio" className="text-slate-400 hover:text-white transition-colors">Voltar ao Topo</a>
              <span className="text-slate-700">•</span>
              <a href="https://instagram.com/ianzinhopaterraoficial" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p className="text-center md:text-left">
              © 2026 — Plataforma criada e desenvolvida com amor por <strong>Marcos Paterra</strong>, papai do Ianzinho. Todos os direitos reservados.
            </p>
            <p className="text-center md:text-right text-slate-500">
              Conteúdo protegido. Feito com amor, respeito e inclusão.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
