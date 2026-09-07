import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  User, 
  Sparkles, 
  Clock, 
  Search, 
  Trash2, 
  CheckCheck, 
  AlertCircle,
  GraduationCap,
  Stethoscope,
  Heart,
  ChevronRight,
  RefreshCw,
  Tag,
  Smile,
  ArrowLeft
} from 'lucide-react';
import { DirectChannel, DirectMessage, SystemUser, UserRole } from '../types';
import { 
  subscribeToChannels, 
  subscribeToMessages, 
  sendMessageToFirestore, 
  deleteMessageFromFirestore 
} from '../lib/firebaseSync';

interface InstantDirectChatProps {
  systemUser: SystemUser | null;
  isAdmin: boolean;
  isParent: boolean;
  isTherapist: boolean;
  isSchool: boolean;
}

const QUICK_TAGS = [
  'Evolução do Dia',
  'Orientação de Casa',
  'Recado Escolar',
  'Dúvida da Família',
  'Aviso Importante'
];

export const InstantDirectChat: React.FC<InstantDirectChatProps> = ({
  systemUser,
  isAdmin,
  isParent,
  isTherapist,
  isSchool
}) => {
  const [channels, setChannels] = useState<DirectChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Can view all channels: Only Parents (Pai e Mãe) and Admin
  const canViewAllChannels = isAdmin || isParent;

  // 1. Subscribe to Channels
  useEffect(() => {
    const unsub = subscribeToChannels((list) => {
      setChannels(list);

      // Auto select channel
      if (!selectedChannelId && list.length > 0) {
        if (!canViewAllChannels) {
          // If therapist or school, match their profile or role
          const userEmail = (systemUser?.email || '').toLowerCase();
          const userName = (systemUser?.name || '').toLowerCase();
          
          let myChannel = list.find(ch => 
            ch.participantId === systemUser?.id ||
            userEmail.includes(ch.participantRole) ||
            userName.includes(ch.participantName.toLowerCase().split(' ')[0]) ||
            (isSchool && ch.participantRole === 'school')
          );

          if (!myChannel) {
            // Fallback to first channel corresponding to role
            myChannel = list.find(ch => ch.participantRole === systemUser?.role) || list[0];
          }

          setSelectedChannelId(myChannel.id);
        } else {
          // Default to first channel for parents
          setSelectedChannelId(list[0].id);
        }
      }
    });

    return () => unsub();
  }, [systemUser, canViewAllChannels, isSchool]);

  // 2. Filter available channels based on permissions
  const visibleChannels = channels.filter(channel => {
    if (canViewAllChannels) {
      // Parents & Admin see ALL channels
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return channel.participantName.toLowerCase().includes(q) ||
        channel.participantRoleTitle.toLowerCase().includes(q) ||
        (channel.lastMessage && channel.lastMessage.toLowerCase().includes(q));
    }

    // Individual constraint: Therapists and School ONLY see their own individual channel with parents
    const userRole = systemUser?.role;
    const userName = (systemUser?.name || '').toLowerCase();
    const userEmail = (systemUser?.email || '').toLowerCase();

    if (userRole === 'school') {
      return channel.participantRole === 'school' || channel.id === 'channel-escola';
    }

    // Specific therapist matching
    if (channel.participantId === systemUser?.id) return true;
    if (userName.includes('karen') && channel.id === 'channel-karen') return true;
    if (userName.includes('barbara') && channel.id === 'channel-barbara') return true;
    if ((userName.includes('edinéia') || userName.includes('edineia')) && channel.id === 'channel-edineia') return true;
    if (userName.includes('marcelo') && channel.id === 'channel-marcelo') return true;
    if (userName.includes('juliana') && channel.id === 'channel-juliana') return true;
    if (channel.id === `channel-${systemUser?.id}`) return true;

    // Fallback: If no channel matched by name/ID, assign strictly the first matching therapist channel so they only ever see ONE channel
    if (userRole === 'therapist' && channel.id === (channels.find(ch => ch.participantRole === 'therapist')?.id || 'channel-karen')) {
      return true;
    }

    return false;
  });

  const activeChannel = channels.find(c => c.id === selectedChannelId) || visibleChannels[0];

  // 3. Subscribe to active channel messages
  useEffect(() => {
    if (!activeChannel) return;

    const unsub = subscribeToMessages(activeChannel.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsub();
  }, [activeChannel?.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChannel || isSending) return;

    const text = inputText.trim();
    const tag = selectedTag || undefined;
    setInputText('');
    setSelectedTag('');
    setIsSending(true);

    try {
      const senderRole: UserRole = systemUser?.role || (isAdmin ? 'admin' : (isParent ? 'parent' : 'therapist'));
      const senderName = systemUser?.name || (isAdmin ? 'Marcos Paterra (Pai & Admin)' : 'Responsável');

      await sendMessageToFirestore({
        channelId: activeChannel.id,
        senderId: systemUser?.id || (isAdmin ? 'admin-marcos' : 'user-session'),
        senderName,
        senderRole,
        senderRoleTitle: systemUser?.roleTitle || (isAdmin ? 'Pai do Ian & Administrador' : 'Equipe'),
        text,
        tag,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Erro ao enviar mensagem:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Deseja realmente apagar esta mensagem instantânea?')) return;
    try {
      await deleteMessageFromFirestore(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.warn('Erro ao excluir mensagem:', err);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Pai & Admin', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'parent':
        return { label: 'Família / Pais', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'therapist':
        return { label: 'Terapeuta', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'school':
        return { label: 'Escola / Pedagógico', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Membro', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div id="instant-direct-chat-module" className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[620px] sm:h-[720px] max-h-[85vh]">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 px-4 sm:px-6 py-3 sm:py-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
            <MessageSquare className="w-5 h-5 text-sky-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black tracking-tight font-kids truncate">
                Mensagens Instantâneas Diretas
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-emerald-950 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-pulse"></span>
                Tempo Real
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-sky-100/90 font-medium truncate sm:whitespace-normal">
              {canViewAllChannels 
                ? 'Central dos Pais: Acesso aos canais individuais com terapeutas e escola' 
                : 'Canal Individual Seguro e Confidencial com os Pais do Ian (Marcos & Alessandra)'}
            </p>
          </div>
        </div>

        {/* Security / Privacy Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-xl border border-white/20 text-xs font-bold shrink-0">
          <Lock className="w-3.5 h-3.5 text-amber-300" />
          <span>Privacidade Garantida</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Channels List (Only available/expandable for Parents & Admin) */}
        {canViewAllChannels && (
          <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200/80 bg-slate-50/50 flex-col shrink-0`}>
            {/* Search filter */}
            <div className="p-3 border-b border-slate-200/70 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar profissional ou escola..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {visibleChannels.map((channel) => {
                const isSelected = channel.id === activeChannel?.id;
                const isSchoolChannel = channel.participantRole === 'school';
                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannelId(channel.id);
                      setMobileView('chat');
                    }}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected 
                        ? 'bg-sky-50/90 border-l-4 border-sky-600 shadow-sm' 
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {channel.participantAvatar ? (
                        <img 
                          src={channel.participantAvatar} 
                          alt={channel.participantName}
                          className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          isSchoolChannel ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {isSchoolChannel ? <GraduationCap className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {channel.participantName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {channel.lastMessageTime || 'Hoje'}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-sky-600 truncate mb-1">
                        {channel.participantRoleTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate leading-snug">
                        {channel.lastMessage || 'Toque para conversar...'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom summary for parents */}
            <div className="p-3 border-t border-slate-200 bg-white/90 text-center">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {visibleChannels.length} canais individuais monitorados
              </span>
            </div>
          </div>
        )}

        {/* Right Column: Active Conversation Messages and Input */}
        <div className={`${canViewAllChannels && mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white overflow-hidden`}>
          {/* Active Channel Header */}
          {activeChannel ? (
            <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Back to Channels Button */}
                {canViewAllChannels && (
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 -ml-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs"
                    title="Voltar aos Canais"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}

                {activeChannel.participantAvatar ? (
                  <img 
                    src={activeChannel.participantAvatar} 
                    alt={activeChannel.participantName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0" 
                  />
                ) : (
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    activeChannel.participantRole === 'school' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {activeChannel.participantRole === 'school' ? <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" /> : <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {activeChannel.participantName}
                    </h3>
                    <span className="px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                      {activeChannel.participantRoleTitle}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <span>Com</span>
                    <strong className="text-slate-700 truncate">Marcos & Alessandra (Pais)</strong>
                  </p>
                </div>
              </div>

              {/* Individual isolation indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shrink-0">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Restrito aos Pais e Profissional</span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">Nenhum canal selecionado</div>
          )}

          {/* Privacy Disclaimer for Professionals */}
          {!canViewAllChannels && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Canal Exclusivo e Sigiloso:</strong> Suas mensagens são lidas e respondidas exclusivamente pelos pais do Ian. Outros profissionais não têm acesso a esta conversa.
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/40 to-white">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 font-kids">Inicie a conversa</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Envie recados rápidos, fotos, condutas ou dúvidas diretamente para a família e equipe.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMyMessage = msg.senderId === systemUser?.id || (canViewAllChannels && (msg.senderRole === 'admin' || msg.senderRole === 'parent'));
                const badge = getRoleBadge(msg.senderRole);

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                  >
                    {/* Author info */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-700">
                        {msg.senderName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {msg.senderRoleTitle || badge.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div className="relative group max-w-lg">
                      <div 
                        className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                          isMyMessage 
                            ? 'bg-sky-600 text-white rounded-tr-xs' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {msg.tag && (
                          <div className={`inline-block mb-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            isMyMessage ? 'bg-sky-700/80 text-sky-100' : 'bg-sky-50 text-sky-700 border border-sky-100'
                          }`}>
                            {msg.tag}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Admin or Author Delete Button */}
                      {(isAdmin || msg.senderId === systemUser?.id) && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50 ${
                            isMyMessage ? '-left-7' : '-right-7'
                          }`}
                          title="Excluir mensagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Tag Pills */}
          <div className="px-3 sm:px-6 pt-2 pb-1 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-slate-400 font-bold shrink-0 text-[10px] uppercase mr-1">Etiqueta:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-2.5 py-1 rounded-full shrink-0 font-medium transition-colors ${
                  selectedTag === tag 
                    ? 'bg-sky-600 text-white font-bold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-2.5 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  canViewAllChannels 
                    ? `Responder a ${activeChannel?.participantName || 'profissional'}...` 
                    : "Mensagem direta para os Pais do Ian (Marcos & Alessandra)..."
                }
                className="w-full pl-3.5 sm:pl-4 pr-10 py-2.5 sm:py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800"
              />
              {selectedTag && (
                <span className="absolute right-3 top-2.5 sm:top-3 px-2 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-800">
                  {selectedTag}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
                inputText.trim() && !isSending
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 hover:from-sky-600 hover:to-indigo-700 cursor-pointer active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
