import { create } from 'zustand';
import type {
  Keyword, KeywordCategory, Platform, Video, HotWord,
  RiskRecord, RiskLevel, RiskType, HandleStatus, Department,
  CreateRiskPayload, HandoverSummary, ShiftType, InspectionConfig,
  ContactedDept
} from '@/types';
import { generateDefaultKeywords, generateVideos, generateHotWords, generateSampleRiskRecords } from '@/data/mockData';
import { generateId } from '@/utils/format';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

interface AppStore {
  config: InspectionConfig;
  videos: Video[];
  hotWords: HotWord[];
  selectedVideo: Video | null;
  riskRecords: RiskRecord[];
  summaries: HandoverSummary[];
  currentShiftSummary: HandoverSummary | null;

  addKeyword: (text: string, category: KeywordCategory) => void;
  removeKeyword: (id: string) => void;
  togglePlatform: (p: Platform) => void;
  setTimeRange: (hours: number) => void;

  fetchVideos: () => void;
  selectVideo: (v: Video | null) => void;

  createRiskRecord: (payload: CreateRiskPayload) => void;
  updateRiskStatus: (id: string, status: HandleStatus) => void;
  addHandleNote: (id: string, note: string) => void;
  addContactDepartment: (id: string, dept: Department) => void;
  removeContactDepartment: (id: string, dept: Department) => void;

  generateSummary: (operatorName: string, shiftType: ShiftType) => HandoverSummary;
  confirmHandover: (summaryId: string, confirmedBy: string) => void;
  setCurrentSummary: (s: HandoverSummary | null) => void;
}

const defaultPlatforms: Platform[] = ['douyin', 'kuaishou', 'shipinhao', 'bilibili', 'xiaohongshu'];

function getInitialState() {
  const storedKeywords = loadFromStorage<Keyword[]>('keywords', null);
  const storedPlatforms = loadFromStorage<Platform[]>('platforms', null);
  const storedRange = loadFromStorage<number>('timeRange', null);
  const storedRecords = loadFromStorage<RiskRecord[]>('riskRecords', null);
  const storedSummaries = loadFromStorage<HandoverSummary[]>('summaries', null);

  const keywords = storedKeywords || generateDefaultKeywords();
  const platforms = storedPlatforms || defaultPlatforms;
  const timeRangeHours = storedRange || 12;
  const keywordTexts = keywords.map((k: Keyword) => k.text);
  let videos = generateVideos(timeRangeHours);
  videos = videos.filter((v: Video) => platforms.includes(v.platform));
  if (keywordTexts.length > 0) {
    videos = videos.filter((v: Video) =>
      v.matchedKeywords.some((mk: string) => keywordTexts.includes(mk)) ||
      keywordTexts.some((kw: string) => v.title.includes(kw))
    );
  }
  const hotWords = generateHotWords(videos);
  const riskRecords = storedRecords && storedRecords.length > 0
    ? storedRecords
    : generateSampleRiskRecords(videos);

  return { keywords, platforms, timeRangeHours, videos, hotWords, riskRecords, storedSummaries };
}

const init = getInitialState();

export const useAppStore = create<AppStore>((set, get) => ({
  config: {
    keywords: init.keywords,
    platforms: init.platforms,
    timeRangeHours: init.timeRangeHours,
  },
  videos: init.videos,
  hotWords: init.hotWords,
  selectedVideo: null,
  riskRecords: init.riskRecords,
  summaries: init.storedSummaries || [],
  currentShiftSummary: null,

  addKeyword: (text, category) => {
    const kw: Keyword = { id: generateId(), text, category, createdAt: Date.now() };
    const newKeywords = [...get().config.keywords, kw];
    set(state => ({ config: { ...state.config, keywords: newKeywords } }));
    saveToStorage('keywords', newKeywords);
    get().fetchVideos();
  },

  removeKeyword: (id) => {
    const newKeywords = get().config.keywords.filter(k => k.id !== id);
    set(state => ({ config: { ...state.config, keywords: newKeywords } }));
    saveToStorage('keywords', newKeywords);
    get().fetchVideos();
  },

  togglePlatform: (p) => {
    const current = get().config.platforms;
    const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    set(state => ({ config: { ...state.config, platforms: next } }));
    saveToStorage('platforms', next);
    get().fetchVideos();
  },

  setTimeRange: (hours) => {
    set(state => ({ config: { ...state.config, timeRangeHours: hours } }));
    saveToStorage('timeRange', hours);
    get().fetchVideos();
  },

  fetchVideos: () => {
    const { timeRangeHours, platforms, keywords } = get().config;
    const keywordTexts = keywords.map(k => k.text);

    if (keywordTexts.length === 0) {
      set({ videos: [], hotWords: [] });
      return;
    }

    let videos = generateVideos(timeRangeHours);
    videos = videos.filter(v => platforms.includes(v.platform));
    videos = videos.filter(v =>
      v.matchedKeywords.some(mk => keywordTexts.includes(mk)) ||
      keywordTexts.some(kw => v.title.includes(kw))
    );
    const hotWords = generateHotWords(videos);
    set({ videos, hotWords });
  },

  selectVideo: (v) => set({ selectedVideo: v }),

  createRiskRecord: (payload) => {
    const video = get().videos.find(v => v.id === payload.videoId);
    const playCount = video?.playCount || 0;
    const record: RiskRecord = {
      id: 'r_' + generateId(),
      videoId: payload.videoId,
      riskType: payload.riskType,
      riskLevel: payload.riskLevel,
      opinion: payload.opinion,
      contactDepartments: [],
      status: 'pending',
      handleNotes: [],
      initialPlayCount: playCount,
      currentPlayCount: playCount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      operator: payload.operator,
    };
    const newRecords = [record, ...get().riskRecords];
    set({ riskRecords: newRecords });
    saveToStorage('riskRecords', newRecords);
  },

  updateRiskStatus: (id, status) => {
    const newRecords = get().riskRecords.map(r =>
      r.id === id ? { ...r, status, updatedAt: Date.now() } : r
    );
    set({ riskRecords: newRecords });
    saveToStorage('riskRecords', newRecords);
  },

  addHandleNote: (id, note) => {
    const newRecords = get().riskRecords.map(r =>
      r.id === id ? {
        ...r,
        handleNotes: [...r.handleNotes, note],
        updatedAt: Date.now(),
      } : r
    );
    set({ riskRecords: newRecords });
    saveToStorage('riskRecords', newRecords);
  },

  addContactDepartment: (id, dept) => {
    const newRecords = get().riskRecords.map(r =>
      r.id === id ? {
        ...r,
        contactDepartments: r.contactDepartments.includes(dept)
          ? r.contactDepartments
          : [...r.contactDepartments, dept],
        updatedAt: Date.now(),
      } : r
    );
    set({ riskRecords: newRecords });
    saveToStorage('riskRecords', newRecords);
  },

  removeContactDepartment: (id, dept) => {
    const newRecords = get().riskRecords.map(r =>
      r.id === id ? {
        ...r,
        contactDepartments: r.contactDepartments.filter(d => d !== dept),
        updatedAt: Date.now(),
      } : r
    );
    set({ riskRecords: newRecords });
    saveToStorage('riskRecords', newRecords);
  },

  generateSummary: (operatorName, shiftType) => {
    const { riskRecords, videos } = get();

    const highRisk = riskRecords.filter(r =>
      r.riskLevel === 'high' || r.riskLevel === 'urgent'
    );

    const updatedRecords = highRisk.map(r => {
      const currentVideo = videos.find(v => v.id === r.videoId);
      const currentPlayCount = currentVideo ? currentVideo.playCount : r.currentPlayCount;
      return { ...r, currentPlayCount };
    });

    const playChanges = updatedRecords.map(r => {
      const delta = r.currentPlayCount - r.initialPlayCount;
      const deltaPercent = r.initialPlayCount > 0 ? delta / r.initialPlayCount : 0;
      return { videoId: r.videoId, delta, deltaPercent };
    });

    let positive = 0, neutral = 0, negative = 0;
    videos.forEach(v => v.hotComments.forEach(c => {
      if (c.sentiment === 'positive') positive++;
      else if (c.sentiment === 'neutral') neutral++;
      else negative++;
    }));
    const total = positive + neutral + negative || 1;

    const deptSet = new Map<Department, ContactedDept>();
    updatedRecords.forEach(r => r.contactDepartments.forEach(d => {
      if (!deptSet.has(d)) {
        const deptNames: Record<Department, string> = {
          customer_service: '客服部', legal: '法务部', product: '产品部',
          marketing: '市场部', store: '门店运营'
        };
        deptSet.set(d, {
          dept: d,
          points: `${deptNames[d]}正在跟进「${r.opinion.slice(0, 20)}」`,
          responsible: r.operator,
        });
      }
    }));

    const nextFocus = updatedRecords
      .filter(r => r.status !== 'resolved')
      .slice(0, 5)
      .map(r => {
        const v = videos.find(x => x.id === r.videoId);
        return v ? `持续监控「${v.title.slice(0, 25)}」` : `跟进风险记录 ${r.id.slice(0, 8)}`;
      });
    if (nextFocus.length === 0) nextFocus.push('继续巡检各平台新增内容');

    const summary: HandoverSummary = {
      id: 's_' + generateId(),
      date: new Date().toISOString().slice(0, 10),
      shiftType,
      operatorName,
      createdAt: Date.now(),
      highRiskVideos: updatedRecords,
      playChanges,
      sentimentStats: {
        positive: positive / total,
        neutral: neutral / total,
        negative: negative / total,
      },
      contactedDepartments: Array.from(deptSet.values()),
      nextShiftFocus: nextFocus,
    };

    const newSummaries = [summary, ...get().summaries];
    const updatedRiskRecords = get().riskRecords.map(r => {
      const updated = updatedRecords.find(u => u.id === r.id);
      return updated ? { ...r, currentPlayCount: updated.currentPlayCount, updatedAt: Date.now() } : r;
    });
    set({ summaries: newSummaries, currentShiftSummary: summary, riskRecords: updatedRiskRecords });
    saveToStorage('summaries', newSummaries);
    saveToStorage('riskRecords', updatedRiskRecords);
    return summary;
  },

  confirmHandover: (summaryId, confirmedBy) => {
    const newSummaries = get().summaries.map(s =>
      s.id === summaryId ? { ...s, confirmedBy } : s
    );
    set({
      summaries: newSummaries,
      currentShiftSummary: get().currentShiftSummary?.id === summaryId
        ? { ...get().currentShiftSummary!, confirmedBy }
        : get().currentShiftSummary,
    });
    saveToStorage('summaries', newSummaries);
  },

  setCurrentSummary: (s) => set({ currentShiftSummary: s }),
}));
