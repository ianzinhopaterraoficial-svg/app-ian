import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Heart, 
  Tag, 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  X, 
  Image as ImageIcon, 
  Check, 
  Share2, 
  Award, 
  BookOpen, 
  Users, 
  Stethoscope, 
  Palette,
  AlertCircle
} from 'lucide-react';
import { MomentRecord, MomentCategory, SystemUser, UserRole } from '../types';

interface MomentsGalleryProps {
  moments: MomentRecord[];
  onAddMoment: (moment: Omit<MomentRecord, 'id'>) => Promise<void>;
  onDeleteMoment: (id: string) => Promise<void>;
  systemUser: SystemUser | null;
  isAdmin: boolean;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    title: 'Musicoterapia & Ritmo',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80',
    cat: 'terapia' as MomentCategory,
    desc: 'Exploração musical e acompanhamento de ritmo com o Ian.'
  },
  {
    title: 'Integração Sensorial & Cores',
    url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
    cat: 'sensorial' as MomentCategory,
    desc: 'Atividade tátil com massinhas e texturas suaves na terapia ocupacional.'
  },
  {
    title: 'Passeio & Conexão em Família',
    url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&auto=format&fit=crop&q=80',
    cat: 'familia' as MomentCategory,
    desc: 'Momento afetivo de lazer e estímulo motor ao ar livre.'
  },
  {
    title: 'Pintura & Artes na Escola',
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
    cat: 'escola' as MomentCategory,
    desc: 'Participação nas atividades de expressão plástica em sala de aula.'
  },
  {
    title: 'Intervenção ABA & Blocos',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
    cat: 'conquista' as MomentCategory,
    desc: 'Treino de emparelhamento de cores e coordenação com reforço positivo.'
  }
];

export const MomentsGallery: React.FC<MomentsGalleryProps> = ({
  moments,
  onAddMoment,
  onDeleteMoment,
  systemUser,
  isAdmin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedMoment, setSelectedMoment] = useState<MomentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Record<string, number>>({});

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MomentCategory>('terapia');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  });
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');
  const [urlError, setUrlError] = useState(false);

  // Filtered moments
  const filteredMoments = useMemo(() => {
    return moments.filter(m => {
      const matchCat = selectedCategory === 'todos' || m.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.authorName.toLowerCase().includes(q) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });
  }, [moments, selectedCategory, searchQuery]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleOpenAddModal = () => {
    // Set default category based on user role
    if (systemUser?.role === 'school') {
      setFormCategory('escola');
    } else if (systemUser?.role === 'parent') {
      setFormCategory('familia');
    } else {
      setFormCategory('terapia');
    }
    setFormPhotoUrl('');
    setFormTitle('');
    setFormDescription('');
    setFormTags('');
    setUrlError(false);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPhotoUrl.trim() || !formDescription.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = formTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await onAddMoment({
        childId: 'ian-paterra-01',
        title: formTitle.trim(),
        description: formDescription.trim(),
        photoUrl: formPhotoUrl.trim(),
        date: formDate.trim() || new Date().toLocaleDateString('pt-BR'),
        category: formCategory,
        authorId: systemUser?.id || 'admin-user',
        authorName: systemUser?.name || 'Equipe Multidisciplinar',
        authorRole: (systemUser?.role as UserRole) || 'admin',
        authorRoleTitle: systemUser?.roleTitle || 'Profissional / Família',
        tags: tagsArray.length > 0 ? tagsArray : ['Registro Visual'],
        createdAt: new Date().toISOString()
      });

      setShowAddModal(false);
      setFormTitle('');
      setFormPhotoUrl('');
      setFormDescription('');
      setFormTags('');
    } catch (err) {
      console.error('Erro ao adicionar momento:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDeleteMoment(id);
    if (selectedMoment?.id === id) {
      setSelectedMoment(null);
    }
  };

  const getCategoryBadge = (cat: MomentCategory) => {
    switch (cat) {
      case 'terapia':
        return {
          label: 'Terapia',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Stethoscope
        };
      case 'sensorial':
        return {
          label: 'Sensorial',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Palette
        };
      case 'familia':
        return {
          label: 'Em Família',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: Heart
        };
      case 'escola':
        return {
          label: 'Escola',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: BookOpen
        };
      case 'conquista':
        return {
          label: 'Conquista',
          bg: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: Award
        };
      default:
        return {
          label: 'Geral',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Sparkles
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs font-kids backdrop-blur-md mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>Memória & Evidências Clínicas</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-kids tracking-tight">
              Galeria de Momentos do Ian
            </h2>
            <p className="text-sky-100 text-sm max-w-2xl mt-1 leading-relaxed">
              Espaço compartilhado entre família e equipe multidisciplinar para registrar fotos de atividades, sessões terapêuticas, interações escolares e conquistas do dia a dia.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3.5 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 transition-all font-bold font-kids text-sm flex items-center gap-2 shadow-lg shadow-black/10 shrink-0 group hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-6 h-6 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span>Compartilhar Foto</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Categories Filter & Search */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'todos', label: 'Todos', count: moments.length },
            { id: 'terapia', label: 'Terapias', count: moments.filter(m => m.category === 'terapia').length },
            { id: 'sensorial', label: 'Sensorial', count: moments.filter(m => m.category === 'sensorial').length },
            { id: 'familia', label: 'Família', count: moments.filter(m => m.category === 'familia').length },
            { id: 'escola', label: 'Escola', count: moments.filter(m => m.category === 'escola').length },
            { id: 'conquista', label: 'Conquistas', count: moments.filter(m => m.category === 'conquista').length },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-kids transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar momento, terapeuta ou tag..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {filteredMoments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-kids text-slate-800 mb-1">Nenhum momento encontrado</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
            {searchQuery 
              ? 'Nenhuma foto corresponde aos termos da busca. Tente buscar por outros termos ou categorias.'
              : 'A galeria ainda não possui fotos nesta categoria. Seja o primeiro a compartilhar um registro visual do Ian!'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold font-kids text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Primeira Foto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMoments.map((moment) => {
            const badge = getCategoryBadge(moment.category);
            const BadgeIcon = badge.icon;
            const canDelete = isAdmin || systemUser?.id === moment.authorId;
            const favCount = (favorites[moment.id] || 0) + (moment.category === 'conquista' ? 5 : 2);

            return (
              <div
                key={moment.id}
                onClick={() => setSelectedMoment(moment)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-sky-300 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Photo Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={moment.photoUrl}
                    alt={moment.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback image
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                    <span className="text-white text-xs font-bold font-kids flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver em detalhes</span>
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-kids border shadow-sm backdrop-blur-md flex items-center gap-1 ${badge.bg}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Date Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{moment.date}</span>
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 font-kids text-base group-hover:text-sky-600 transition-colors leading-snug mb-2">
                      {moment.title}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-3">
                      {moment.description}
                    </p>

                    {/* Tags */}
                    {moment.tags && moment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {moment.tags.slice(0, 3).map((tag, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Author Footer & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold font-kids text-xs flex items-center justify-center border border-sky-200">
                        {moment.authorName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-800 leading-tight font-kids">
                          {moment.authorName}
                        </p>
                        <p className="text-[9px] text-slate-400 leading-tight">
                          {moment.authorRoleTitle || 'Equipe'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Heart celebration button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(moment.id, e)}
                        className="px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold flex items-center gap-1 transition-all"
                        title="Celebrar momento"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        <span>{favCount}</span>
                      </button>

                      {/* Delete option if authorized */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(moment.id, e)}
                          className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Excluir foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Adicionar Novo Momento */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-kids text-slate-900">Novo Registro Visual</h3>
                  <p className="text-xs text-slate-500">Compartilhe uma foto para o prontuário do Ian</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo URL & Live Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  URL da Foto *
                </label>
                <input
                  type="url"
                  required
                  value={formPhotoUrl}
                  onChange={(e) => {
                    setFormPhotoUrl(e.target.value);
                    setUrlError(false);
                  }}
                  placeholder="https://exemplo.com/foto-do-ian.jpg"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Cole o link público de uma imagem (Google Fotos compartilhado, Unsplash, Imgur, etc.)
                </p>
              </div>

              {/* Quick Image Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Sugestões de fotos de exemplo (1 clique):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormPhotoUrl(p.url);
                        setFormTitle(p.title);
                        setFormCategory(p.cat);
                        setFormDescription(p.desc);
                        setUrlError(false);
                      }}
                      className="p-2 text-left rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 transition-all text-[11px] font-medium text-slate-700 truncate"
                    >
                      <p className="font-bold truncate text-slate-800">{p.title}</p>
                      <p className="text-[9px] text-slate-400 capitalize">{p.cat}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {formPhotoUrl && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                    <img 
                      src={formPhotoUrl} 
                      alt="Pré-visualização" 
                      className="w-full h-full object-cover"
                      onError={() => setUrlError(true)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Pré-visualização da Foto</p>
                    {urlError ? (
                      <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        URL inacessível ou inválida
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" />
                        Imagem carregada com sucesso!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Título do Momento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Pintura com as mãos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MomentCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="terapia">Terapia (Fono, T.O., ABA, Música)</option>
                    <option value="sensorial">Integração Sensorial</option>
                    <option value="familia">Em Família (Parque, Casa, Brincadeiras)</option>
                    <option value="escola">Escola Reino das Letras</option>
                    <option value="conquista">Conquista / Superação de Meta</option>
                    <option value="geral">Outros Registros</option>
                  </select>
                </div>
              </div>

              {/* Date & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Data do Registro
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Palavras-chave / Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Ex: T.O., Texturas, Sorriso"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descrição / Relato do Momento *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva o que o Ian fez, como reagiu, quais foram os avanços ou a relevância clínica/afetiva deste momento..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Author signature tag */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Publicando como:</span>
                <span className="font-bold text-sky-800 font-kids">
                  {systemUser?.name || 'Administrador'} ({systemUser?.roleTitle || 'Equipe'})
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold font-kids text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold font-kids text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span>Salvando no Firestore...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar na Galeria</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualização Expandida do Momento */}
      {selectedMoment && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Expanded Image */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-black">
              <img
                src={selectedMoment.photoUrl}
                alt={selectedMoment.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedMoment(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Section */}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-kids border ${getCategoryBadge(selectedMoment.category).bg}`}>
                    {getCategoryBadge(selectedMoment.category).label}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedMoment.date}
                  </span>
                </div>

                <a
                  href={selectedMoment.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold font-kids flex items-center gap-1"
                >
                  <span>Abrir imagem original</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <h2 className="text-xl md:text-2xl font-black font-kids text-slate-900 mb-3">
                {selectedMoment.title}
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed mb-6 whitespace-pre-line">
                {selectedMoment.description}
              </p>

              {/* Tags */}
              {selectedMoment.tags && selectedMoment.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedMoment.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3 text-sky-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Author & Action footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 font-bold font-kids text-sm flex items-center justify-center border border-sky-200">
                    {selectedMoment.authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-kids">
                      Registrado por: {selectedMoment.authorName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {selectedMoment.authorRoleTitle || 'Equipe Multidisciplinar'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMoment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-kids text-xs transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
