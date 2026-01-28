
import React from 'react';
import type { TimerState, Language } from '../types';
import { ShareIcon, AmbulanceIcon, WokIcon, MarketLampIcon } from './Icons';

type TFunction = (key: string, ...args: any[]) => string;

interface TimerDisplayProps {
  t: TFunction;
  timeRemaining: number;
  calculatedTime: number;
  timerState: TimerState;
  onStopAlarmOrFinish: () => void;
  onFeedback: (feedback: 'undercooked' | 'perfect' | 'overcooked') => void;
  onStartRescue: () => void;
  fishName: string;
  weightString: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  t,
  timeRemaining,
  calculatedTime,
  timerState,
  onStopAlarmOrFinish,
  onFeedback,
  onStartRescue,
  fishName,
  weightString,
}) => {
  const createShareLink = () => {
    const text = t('shareText', weightString, fishName);
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  if (timerState === 'feedback') {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] text-center min-h-[340px] bg-gray-800/50 p-8 space-y-6 border border-gray-700 shadow-inner">
          <div>
            <h3 className="text-2xl font-black text-white mb-2">{t('feedbackTitle')}</h3>
            <p className="text-sm font-bold text-gray-400 px-4">{t('feedbackSubtitle')}</p>
          </div>
          <div className="w-full grid grid-cols-1 gap-3">
            {[
              { id: 'perfect', color: 'bg-emerald-600 text-white shadow-emerald-900/30' },
              { id: 'undercooked', color: 'bg-orange-800 text-orange-200 shadow-orange-900/20' },
              { id: 'overcooked', color: 'bg-gray-700 text-gray-200 shadow-gray-900/20' }
            ].map((btn) => (
              <button 
                key={btn.id}
                onClick={() => onFeedback(btn.id as any)} 
                className={`py-4 px-4 ${btn.color} rounded-2xl font-extrabold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md`}
              >
                {t(btn.id)}
              </button>
            ))}
          </div>
          <div className="w-full flex gap-3 pt-2">
            <button onClick={onStartRescue} className="flex-1 flex items-center justify-center py-4 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-900/40 hover:bg-red-700 active:scale-[0.98] transition-all">
              <AmbulanceIcon className="w-5 h-5 mr-2" />
              <span className="uppercase tracking-widest">{t('rescueButton')}</span>
            </button>
            <a href={createShareLink()} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-900/40 hover:bg-emerald-700 active:scale-[0.98] transition-all">
              <ShareIcon className="w-5 h-5 mr-2" />
              <span className="uppercase tracking-widest">{t('shareResult')}</span>
            </a>
          </div>
      </div>
    );
  }

  const getPhaseConfig = () => {
    switch (timerState) {
      case 'idle': return { status: t('estimatedTime'), ringColor: 'stroke-gray-800', activeRing: 'stroke-gray-700', textColor: 'text-white', progress: 1, displayTime: calculatedTime, icon: null };
      case 'steaming': return { status: t('steaming'), ringColor: 'stroke-red-900/50', activeRing: 'stroke-red-600', textColor: 'text-red-500', progress: calculatedTime > 0 ? timeRemaining / calculatedTime : 0, displayTime: timeRemaining, icon: '🔥' };
      case 'resting': return { status: t('resting'), ringColor: 'stroke-orange-900/50', activeRing: 'stroke-orange-500', textColor: 'text-orange-500', progress: timeRemaining / 120, displayTime: timeRemaining, icon: <WokIcon className="w-10 h-10" /> };
      case 'rescue': return { status: t('rescueing'), ringColor: 'stroke-red-900/50', activeRing: 'stroke-red-600', textColor: 'text-red-500', progress: timeRemaining / 90, displayTime: timeRemaining, icon: '🔥' };
      case 'heat_alarm': return { status: t('stopAlarm'), ringColor: 'stroke-red-800', activeRing: 'stroke-red-600', textColor: 'text-red-500', progress: 1, displayTime: timeRemaining, urgent: true, icon: <MarketLampIcon className="w-16 h-16" /> };
      case 'ready_alarm': return { status: t('serveNow'), ringColor: 'stroke-emerald-800', activeRing: 'stroke-emerald-500', textColor: 'text-emerald-500', progress: 1, displayTime: 0, urgent: true, icon: '😋' };
      default: return { status: '', ringColor: '', activeRing: '', textColor: '', progress: 0, displayTime: 0, icon: null };
    }
  };

  const config = getPhaseConfig();
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.max(0, config.progress));

  const isLongText = config.status.length > 5;

  return (
    <div className={`relative flex flex-col items-center justify-center py-2 space-y-4 min-h-[340px] transition-all duration-700`}>
      
      {config.urgent && (
        <div 
          onClick={onStopAlarmOrFinish} 
          className={`absolute inset-0 z-30 cursor-pointer rounded-[2rem] bg-black/20 animate-pulse-fast active:scale-[0.98] transition-transform`}
          aria-label="Stop Alarm"
        >
        </div>
      )}

      <div className="relative w-64 h-64">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" className={config.ringColor} strokeWidth="12"></circle>
          <circle 
            cx="100" 
            cy="100" 
            r={radius} 
            fill="none" 
            className={`transition-all duration-1000 linear ${config.activeRing}`} 
            strokeWidth="12" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="butt"
          ></circle>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {!config.urgent ? (
            <div className="flex flex-col items-center justify-center transition-opacity duration-300 opacity-100 w-full h-full">
              <div className="mb-1 h-10 flex items-center justify-center">
                {config.icon && (typeof config.icon === 'string' ? <span className="text-3xl">{config.icon}</span> : config.icon)}
              </div>
              <span className={`text-6xl font-black font-mono-timer tracking-tighter leading-none ${config.textColor}`}>
                {formatTime(config.displayTime)}
              </span>
              <p className={`w-4/5 mx-auto text-[11px] font-black uppercase tracking-tight text-gray-400 mt-1 break-words leading-tight text-center h-auto`}>
                {config.status}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center transition-opacity duration-300 opacity-100 animate-bounce-short w-full h-full">
              <div className="mb-2 transform scale-125">
                {config.icon}
              </div>
              <h4 className={`w-[90%] mx-auto break-words leading-none mb-1 text-center font-black uppercase tracking-tighter ${isLongText ? 'text-xl' : 'text-3xl'} ${timerState === 'heat_alarm' ? 'text-red-500' : 'text-emerald-500'}`}>
                {config.status}
              </h4>
              <div className="mt-1">
                <span className="text-[10px] font-black bg-white text-gray-900 py-1 px-4 rounded-full shadow-lg uppercase tracking-widest whitespace-nowrap">
                  {t('dismissAlarm')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .animate-pulse-fast { animation: pulse-fast 0.6s ease-in-out infinite; }
        @keyframes pulse-fast { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
        
        .animate-bounce-short { animation: bounce-short 1s ease-in-out infinite; }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};
