
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FISH_CATEGORIES, TAELS_PER_CATTY, GRAMS_PER_TAEL, BASE_TIME_SECONDS, SECONDS_PER_TAEL_ADJUSTMENT, RESTING_TIME_SECONDS } from './constants';
import type { TimerState, Fish, Language } from './types';
import { translations } from './translations';
import { TimerDisplay } from './components/TimerDisplay';
import { RecipeModal } from './components/RecipeModal';
import { SauceCalculator } from './components/SauceCalculator';
import { FishIcon, WeightIcon, BookOpenIcon, PlayIcon, RotateCwIcon } from './components/Icons';

const useWakeLock = () => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch (err) {}
    }
  }, []);
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try { await wakeLockRef.current.release(); wakeLockRef.current = null; } catch (err) {}
    }
  }, []);
  return { requestWakeLock, releaseWakeLock };
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [catties, setCatties] = useState<number>(1);
  const [taels, setTaels] = useState<number>(0);
  const [grams, setGrams] = useState<number>(TAELS_PER_CATTY * GRAMS_PER_TAEL);
  const [fishTypeId, setFishTypeId] = useState<string>(FISH_CATEGORIES[0].fishes[0].id);
  const [calculatedTime, setCalculatedTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [userTimeOffset, setUserTimeOffset] = useState<number>(0);
  const [isRecipeModalOpen, setRecipeModalOpen] = useState<boolean>(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const t = useCallback((key: keyof (typeof translations)['zh'], ...args: any[]) => {
    const translationSet = translations[language] || translations.zh;
    const stringTemplate = (translationSet as any)[key] || (translations.zh as any)[key];
    if (typeof stringTemplate === 'function') return (stringTemplate as any)(...args);
    return stringTemplate;
  }, [language]);
  
  useEffect(() => {
    const savedOffset = localStorage.getItem('userTimeOffset');
    if (savedOffset) setUserTimeOffset(parseInt(savedOffset, 10) || 0);
  }, []);

  const handleCattyTaelChange = useCallback((newCattiesStr: string, newTaelsStr:string) => {
    const newCatties = parseInt(newCattiesStr, 10) || 0;
    const newTaels = parseInt(newTaelsStr, 10) || 0;
    setCatties(newCatties); setTaels(newTaels);
    const totalTaels = newCatties * TAELS_PER_CATTY + newTaels;
    setGrams(parseFloat((totalTaels * GRAMS_PER_TAEL).toFixed(1)));
  }, []);
  
  const handleGramsChange = useCallback((newGramsStr: string) => {
    const newGrams = parseFloat(newGramsStr) || 0;
    setGrams(newGrams);
    if (newGrams === 0) { setCatties(0); setTaels(0); return; }
    const totalTaels = newGrams / GRAMS_PER_TAEL;
    let newCatties = Math.floor(totalTaels / TAELS_PER_CATTY);
    let newTaels = Math.round(totalTaels % TAELS_PER_CATTY);
    if (newTaels === TAELS_PER_CATTY) { newCatties += 1; newTaels = 0; }
    setCatties(newCatties); setTaels(newTaels);
  }, []);

  useEffect(() => {
    const totalTaels = catties * TAELS_PER_CATTY + taels;
    if (totalTaels <= 0) { setCalculatedTime(0); return; }
    const selectedFish = FISH_CATEGORIES.flatMap(category => category.fishes).find(f => f.id === fishTypeId);
    const multiplier = selectedFish ? selectedFish.multiplier : 1.0;
    const baseTime = BASE_TIME_SECONDS + ((totalTaels - TAELS_PER_CATTY) * SECONDS_PER_TAEL_ADJUSTMENT);
    const finalTime = Math.max(0, Math.round(baseTime * multiplier) + userTimeOffset);
    setCalculatedTime(finalTime);
    if (['idle', 'feedback'].includes(timerState)) setTimeRemaining(finalTime);
  }, [catties, taels, fishTypeId, timerState, userTimeOffset]);

  const stopAlarm = useCallback(() => { if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current); alarmIntervalRef.current = null; }, []);
  const playAlarm = useCallback((type: 'urgent' | 'notify') => {
    if (!audioCtxRef.current) return;
    stopAlarm();
    const playSequence = () => {
        if (!audioCtxRef.current) return;
        const now = audioCtxRef.current.currentTime;
        if(type === 'urgent') { for (let i = 0; i < 4; i++) { const osc = audioCtxRef.current.createOscillator(); osc.type = 'square'; osc.frequency.setValueAtTime(1200, now); osc.connect(audioCtxRef.current.destination); osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.06); } } 
        else { const osc1 = audioCtxRef.current.createOscillator(); osc1.type = 'sine'; osc1.frequency.setValueAtTime(1000, now); osc1.connect(audioCtxRef.current.destination); osc1.start(now); osc1.stop(now + 0.15); const osc2 = audioCtxRef.current.createOscillator(); osc2.type = 'sine'; osc2.frequency.setValueAtTime(1200, now); osc2.connect(audioCtxRef.current.destination); osc2.start(now + 0.2); osc2.stop(now + 0.2 + 0.15); }
    };
    playSequence();
    alarmIntervalRef.current = window.setInterval(playSequence, type === 'urgent' ? 1000 : 1500);
  }, [stopAlarm]);
  
  useEffect(() => {
    if (timeRemaining > 0) return;
    if (timerState === 'steaming') { setTimerState('heat_alarm'); setTimeRemaining(RESTING_TIME_SECONDS); } 
    else if (['heat_alarm', 'resting'].includes(timerState)) { setTimerState('ready_alarm'); }
    else if (timerState === 'rescue') { setTimerState('feedback'); }
  }, [timeRemaining, timerState]);

  useEffect(() => {
    let intervalId: number | undefined;
    if (['steaming', 'heat_alarm', 'resting', 'rescue'].includes(timerState)) {
      intervalId = window.setInterval(() => setTimeRemaining(prev => Math.max(0, prev - 1)), 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerState]);

  useEffect(() => {
    if (timerState === 'heat_alarm' || timerState === 'ready_alarm') playAlarm(timerState === 'heat_alarm' ? 'urgent' : 'notify');
    else stopAlarm();
    return stopAlarm;
  }, [timerState, playAlarm, stopAlarm]);

  useEffect(() => {
    if (!['idle', 'feedback'].includes(timerState)) requestWakeLock();
    else releaseWakeLock();
    return () => { releaseWakeLock() };
  }, [timerState, requestWakeLock, releaseWakeLock]);

  const handleStartSteaming = () => { if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); setTimeRemaining(calculatedTime); setTimerState('steaming'); };
  const handleStopAlarmOrFinish = () => { if (timerState === 'heat_alarm') setTimerState('resting'); else if (timerState === 'ready_alarm') { setTimerState('feedback'); stopAlarm(); } };
  const handleFeedback = (feedback: 'undercooked' | 'perfect' | 'overcooked') => { let newOffset = userTimeOffset; if (feedback === 'undercooked') newOffset += 30; if (feedback === 'overcooked') newOffset -= 30; setUserTimeOffset(newOffset); localStorage.setItem('userTimeOffset', String(newOffset)); setTimerState('idle'); };
  const handleReset = () => { setTimerState('idle'); };
  const handleStartRescue = () => { setTimeRemaining(90); setTimerState('rescue'); };

  const selectedFish = FISH_CATEGORIES.flatMap(category => category.fishes).find(f => f.id === fishTypeId) as Fish;
  const totalTaels = catties * TAELS_PER_CATTY + taels;
  const weightString = `${catties ? `${catties}${t('catties')}` : ''}${taels ? `${taels}${t('taels')}` : ''}`.trim() || `0${t('catties')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md bg-gray-900 rounded-3xl shadow-2xl shadow-black/30 p-8 md:p-10 space-y-8 border border-gray-800 transition-all duration-500">
        
        <header className="flex flex-col items-center text-center space-y-4">
            <img src="logo.png" alt="FishTimer Logo" className="w-24 h-24 mx-auto object-contain" />
            <div className="flex p-1 bg-gray-800 rounded-full shadow-inner border border-gray-700/50">
                {(['zh', 'ph', 'id'] as Language[]).map(lang => (
                    <button 
                      key={lang} 
                      onClick={() => setLanguage(lang)} 
                      className={`px-4 py-1.5 text-[10px] font-black rounded-full tracking-widest transition-all duration-300 ${language === lang ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        {lang === 'zh' ? '繁體' : lang === 'ph' ? 'TAG' : 'IND'}
                    </button>
                ))}
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase">{t('appName')}</h1>
                <p className="text-red-600 font-black text-[10px] mt-1 uppercase tracking-[0.3em]">{t('appVersion')}</p>
            </div>
        </header>

        {timerState === 'idle' && userTimeOffset !== 0 && (
          <div className="bg-red-900/30 text-red-400 text-[10px] font-black tracking-widest uppercase text-center py-2 px-4 rounded-full border border-red-800">
            {t('smartMemoryBadge')} ({userTimeOffset > 0 ? '+' : ''}{userTimeOffset}S)
          </div>
        )}

        <div className={`${timerState !== 'idle' ? 'hidden' : 'space-y-8'}`}>
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="flex items-center text-lg font-bold text-white uppercase tracking-tight">
                      <WeightIcon className="w-8 h-8 text-white mr-2" /><span className="ml-1">{t('fishWeight')}</span>
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-300">
                            <div className="relative flex-1">
                                <input type="number" value={catties} onChange={e => handleCattyTaelChange(e.target.value, String(taels))} className="w-full py-4 text-center font-black text-3xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" min="0" />
                                <span className="absolute bottom-1 left-0 right-0 text-[10px] text-center font-black text-gray-600 uppercase tracking-tighter">{t('catties')}</span>
                            </div>
                            <div className="w-px h-10 bg-gray-200 my-auto"></div>
                            <div className="relative flex-1">
                                <input type="number" value={taels} onChange={e => handleCattyTaelChange(String(catties), e.target.value)} className="w-full py-4 text-center font-black text-3xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" min="0" max="15"/>
                                <span className="absolute bottom-1 left-0 right-0 text-[10px] text-center font-black text-gray-600 uppercase tracking-tighter">{t('taels')}</span>
                            </div>
                        </div>
                        <div className="relative bg-white p-1.5 rounded-2xl shadow-sm border border-gray-300">
                            <input type="number" value={grams} onChange={e => handleGramsChange(e.target.value)} className="w-full py-4 text-center font-black text-3xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" min="0"/>
                            <span className="absolute bottom-1 left-0 right-0 text-[10px] text-center font-black text-gray-600 uppercase tracking-tighter">{t('grams')}</span>
                        </div>
                    </div>
                </div>
                <SauceCalculator totalTaels={totalTaels} t={t as any} />
            </div>

            <div className="space-y-3">
                <label htmlFor="fish-type" className="flex items-center text-lg font-bold text-white uppercase tracking-tight">
                  <FishIcon className="w-8 h-8 text-white mr-2" /><span className="ml-1">{t('fishType')}</span>
                </label>
                <div className="relative group">
                  <select 
                    id="fish-type" 
                    value={fishTypeId} 
                    onChange={e => setFishTypeId(e.target.value)} 
                    className="w-full p-4 bg-white border-2 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-2xl appearance-none font-bold text-gray-900 cursor-pointer transition-all"
                  >
                    {FISH_CATEGORIES.map(category => (
                      <optgroup key={category.label} label={category.label} className="font-black text-gray-900">
                        {category.fishes.map(fish => (
                          <option key={fish.id} value={fish.id} className="text-gray-900 bg-white font-bold">
                            {fish.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-600 group-hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
            </div>
        </div>

        <TimerDisplay 
          t={t as any} 
          timeRemaining={timeRemaining} 
          calculatedTime={calculatedTime} 
          timerState={timerState} 
          onStopAlarmOrFinish={handleStopAlarmOrFinish} 
          onFeedback={handleFeedback} 
          onStartRescue={handleStartRescue} 
          fishName={selectedFish.name} 
          weightString={weightString} 
        />
        
        <div className="pt-4">
          {timerState === 'idle' ? (
            <button 
              onClick={handleStartSteaming} 
              disabled={calculatedTime <= 0} 
              className="w-full flex items-center justify-center py-4 px-8 rounded-2xl font-bold text-lg text-white bg-red-600 shadow-lg shadow-red-900/50 hover:bg-red-700 active:scale-[0.96] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-tighter"
            >
              <PlayIcon className="w-6 h-6 mr-3" /><span>{t('startSteaming')}</span>
            </button>
          ) : (
            !['feedback'].includes(timerState) && (
              <button 
                onClick={handleReset} 
                className="w-full flex items-center justify-center py-4 px-8 rounded-2xl font-bold text-lg bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.96] transition-all uppercase tracking-tighter shadow-xl"
              >
                <RotateCwIcon className="w-6 h-6 mr-3" /><span>{t('cancelReset')}</span>
              </button>
            )
          )}
        </div>

        <div className="text-center">
            <button 
              onClick={() => setRecipeModalOpen(true)} 
              className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-red-500 transition-colors"
            >
              <BookOpenIcon className="w-4 h-4 mr-2" /><span>{t('recipe')}</span>
            </button>
        </div>
      </main>
      <footer className="text-center pt-8">
        <p className="text-xs text-gray-600">
            Designed & Developed by <a href="https://www.toplinkhk.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-red-600 transition-colors">Toplink IT Solutions</a>
        </p>
      </footer>
      <RecipeModal isOpen={isRecipeModalOpen} onClose={() => setRecipeModalOpen(false)} t={t as any} />
    </div>
  );
};

export default App;
