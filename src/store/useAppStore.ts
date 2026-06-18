import { create } from 'zustand';
import type {
  Keyword, KeywordCategory, Platform, Video, HotWord, VideoSnapshot, PlayHistoryPoint,
  RiskRecord, RiskLevel, RiskType, HandleStatus, Department,
  CreateRiskPayload, HandoverSummary, ShiftType, InspectionConfig,
  ContactedDept, PlaySnapshot, SnapshotType, TopGrower
} from '@/types';
import { SNAPSHOT_LABEL } from '@/types';
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
  playSnapshots: PlaySnapshot[];

  addKeyword: (text: string, category: KeywordCategory) => void;
  removeKeyword: (id: string) => void;
  toggleKeyword: (id: string) => void;
  toggleCategoryKeywords: (category: KeywordCategory, enabled: boolean) => void;
  importKeywords: (items: { text: string; category: KeywordCategory }[]) => { added: number; skipped: number };
  exportKeywords: () => string;
  togglePlatform: (p: Platform) => void;
  setTimeRange: (hours: number) => void;

  fetchVideos: (snapshotType?: SnapshotType) => void;
  recordPlaySnapshot: (type: SnapshotType, label?: string) => PlaySnapshot | null;
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

function normalizeKeyword(k: any): Keyword {
  return {
    id: k.id || generateId(),
    text: k.text || '',
    category: k.category || 'brand',
    enabled: k.enabled !== false,
    createdAt: k.createdAt || Date.now(),
  };
}

function normalizeRiskRecord(r: any, videosMap: Map<string, Video>): RiskRecord {
  const vs = r.videoSnapshot;
  let snapshot: VideoSnapshot;
  if (vs) {
    snapshot = vs;
  } else {
    const v = videosMap.get(r.videoId);
    snapshot = v ? {
      videoId: v.id,
      title: v.title,
      coverUrl: v.coverUrl,
      videoUrl: v.videoUrl,
      platform: v.platform,
      authorName: v.authorName,
      playCount: v.playCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      shareCount: v.shareCount,
      spreadScore: v.spreadScore,
      negativeRate: v.negativeRate,
      snapshotAt: r.createdAt,
    } : {
      videoId: r.videoId,
      title: '[视频已下线]',
      coverUrl: '',
      videoUrl: '',
      platform: 'douyin',
      authorName: '',
      playCount: r.initialPlayCount || 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      spreadScore: 0,
      negativeRate: 0,
      snapshotAt: r.createdAt,
    };
  }
  const initialPc = r.initialPlayCount ?? snapshot.playCount;
  const currentPc = r.currentPlayCount ?? initialPc;
  let playHistory: PlayHistoryPoint[] = r.playHistory;
  if (!playHistory || playHistory.length === 0) {
    playHistory = [
      { at: snapshot.snapshotAt, playCount: initialPc, snapshotType: 'mark_risk' },
      { at: Date.now(), playCount: currentPc, snapshotType: 'generate_summary' },
    ];
  }
  return {
    id: r.id,
    videoId: r.videoId,
    riskType: r.riskType,
    riskLevel: r.riskLevel,
    opinion: r.opinion,
    contactDepartments: r.contactDepartments || [],
    status: r.status || 'pending',
    handleNotes: r.handleNotes || [],
    initialPlayCount: initialPc,
    currentPlayCount: currentPc,
    playHistory,
    videoSnapshot: snapshot,
    createdAt: r.createdAt || Date.now(),
    updatedAt: r.updatedAt || Date.now(),
    operator: r.operator || '未登记',
  };
}

function getInitialState() {
  const storedKeywords = loadFromStorage<any[]>('keywords', null);
  const storedPlatforms = loadFromStorage<Platform[]>('platforms', null);
  const storedRange = loadFromStorage<number>('timeRange', null);
  const storedRecords = loadFromStorage<any[]>('riskRecords', null);
  const storedSummaries = loadFromStorage<HandoverSummary[]>('summaries', null);
  const storedSnapshots = loadFromStorage<PlaySnapshot[]>('playSnapshots', null);

  const keywords = storedKeywords ? storedKeywords.map(normalizeKeyword) : generateDefaultKeywords();
  const platforms = storedPlatforms || defaultPlatforms;
  const timeRangeHours = storedRange || 12;
  const enabledKeywordTexts = keywords.filter(k => k.enabled).map(k => k.text);
  let videos = generateVideos(timeRangeHours);
  videos = videos.filter(v => platforms.includes(v.platform));
  if (enabledKeywordTexts.length > 0) {
    videos = videos.filter(v =>
      v.matchedKeywords.some(mk => enabledKeywordTexts.includes(mk)) ||
      enabledKeywordTexts.some(kw => v.title.includes(kw))
    );
  }
  const videosMap = new Map(videos.map(v => [v.id, v]));
  const hotWords = generateHotWords(videos);
  const riskRecords = storedRecords && storedRecords.length > 0
    ? storedRecords.map(r => normalizeRiskRecord(r, videosMap))
    : generateSampleRiskRecords(videos);

  const initialSnapshot: PlaySnapshot[] = storedSnapshots && storedSnapshots.length > 0
    ? storedSnapshots
    : [{
      id: 'ps_' + generateId(),
      type: 'shift_start',
      label: SNAPSHOT_LABEL.shift_start,
      at: Date.now(),
      entries: videos.map(v => ({
        videoId: v.id,
        playCount: v.playCount,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
      })),
    }];

  return {
    keywords,
    platforms,
    timeRangeHours,
    videos,
    hotWords,
    riskRecords,
    storedSummaries,
    playSnapshots: initialSnapshot,
  };
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
  playSnapshots: init.playSnapshots,

  addKeyword: (text, category) => {
    const kw: Keyword = { id: generateId(), text, category, enabled: true, createdAt: Date.now() };
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

  toggleKeyword: (id) => {
    const newKeywords = get().config.keywords.map(k =>
      k.id === id ? { ...k, enabled: !k.enabled } : k
    );
    set(state => ({ config: { ...state.config, keywords: newKeywords } }));
    saveToStorage('keywords', newKeywords);
    get().fetchVideos();
  },

  toggleCategoryKeywords: (category, enabled) => {
    const newKeywords = get().config.keywords.map(k =>
      k.category === category ? { ...k, enabled } : k
    );
    set(state => ({ config: { ...state.config, keywords: newKeywords } }));
    saveToStorage('keywords', newKeywords);
    get().fetchVideos();
  },

  importKeywords: (items) => {
    const existing = new Set(
      get().config.keywords.map(k => `${k.text}|${k.category}`)
    );
    let added = 0, skipped = 0;
    const newList: Keyword[] = [...get().config.keywords];
    items.forEach(({ text, category }) => {
      const t = text.trim();
      if (!t) { skipped++; return; }
      const key = `${t}|${category}`;
      if (existing.has(key)) { skipped++; return; }
      existing.add(key);
      newList.push({
        id: generateId(),
        text: t,
        category,
        enabled: true,
        createdAt: Date.now(),
      });
      added++;
    });
    set(state => ({ config: { ...state.config, keywords: newList } }));
    saveToStorage('keywords', newList);
    get().fetchVideos();
    return { added, skipped };
  },

  exportKeywords: () => {
    const rows = get().config.keywords.map(k => `${k.text}\t${k.category}\t${k.enabled ? '启用' : '停用'}`);
    return ['关键词\t类别\t状态', ...rows].join('\n');
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

  recordPlaySnapshot: (type, label) => {
    const { videos } = get();
    if (videos.length === 0) return null;
    const snap: PlaySnapshot = {
      id: 'ps_' + generateId(),
      type,
      label: label || SNAPSHOT_LABEL[type],
      at: Date.now(),
      entries: videos.map(v => ({
        videoId: v.id,
        playCount: v.playCount,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
      })),
    };
    const next = [...get().playSnapshots, snap].slice(-20);
    set({ playSnapshots: next });
    saveToStorage('playSnapshots', next);
    return snap;
  },

  fetchVideos: (snapshotType) => {
    const { timeRangeHours, platforms, keywords } = get().config;
    const enabledKeywordTexts = keywords.filter(k => k.enabled).map(k => k.text);

    if (enabledKeywordTexts.length === 0) {
      set({ videos: [], hotWords: [] });
      return;
    }

    let videos = generateVideos(timeRangeHours);
    videos = videos.filter(v => platforms.includes(v.platform));
    videos = videos.filter(v =>
      v.matchedKeywords.some(mk => enabledKeywordTexts.includes(mk)) ||
      enabledKeywordTexts.some(kw => v.title.includes(kw))
    );
    const hotWords = generateHotWords(videos);
    set({ videos, hotWords });

    if (snapshotType) {
      get().recordPlaySnapshot(snapshotType);
    }
  },

  selectVideo: (v) => set({ selectedVideo: v }),

  createRiskRecord: (payload) => {
    const video = get().videos.find(v => v.id === payload.videoId);
    const playCount = video?.playCount || 0;
    const snapshot: VideoSnapshot = video
      ? {
        videoId: video.id,
        title: video.title,
        coverUrl: video.coverUrl,
        videoUrl: video.videoUrl,
        platform: video.platform,
        authorName: video.authorName,
        playCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        shareCount: video.shareCount,
        spreadScore: video.spreadScore,
        negativeRate: video.negativeRate,
        snapshotAt: Date.now(),
      }
      : {
        videoId: payload.videoId,
        title: '[视频已下线]',
        coverUrl: '',
        videoUrl: '',
        platform: 'douyin',
        authorName: '',
        playCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        spreadScore: 0,
        negativeRate: 0,
        snapshotAt: Date.now(),
      };

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
      playHistory: [{ at: Date.now(), playCount, snapshotType: 'mark_risk' }],
      videoSnapshot: snapshot,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      operator: payload.operator,
    };
    const newRecords = [record, ...get().riskRecords];
    set({ riskRecords: newRecords });
    saveToStorage('riskRecords', newRecords);
    get().recordPlaySnapshot('mark_risk');
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
    const { riskRecords, videos, playSnapshots: existingSnaps } = get();

    const genSnap = get().recordPlaySnapshot('generate_summary');
    const allSnaps = genSnap ? [...existingSnaps, genSnap] : existingSnaps;

    const currentVideosMap = new Map(videos.map(v => [v.id, v]));

    const highRisk = riskRecords.filter(r =>
      r.riskLevel === 'high' || r.riskLevel === 'urgent'
    );

    const updatedRecords = highRisk.map(r => {
      const currentVideo = currentVideosMap.get(r.videoId);
      const snapshotPlay = currentVideo ? currentVideo.playCount : r.currentPlayCount;
      const historyItem: PlayHistoryPoint = {
        at: Date.now(),
        playCount: snapshotPlay,
        snapshotType: 'generate_summary',
      };
      const lastHistory = r.playHistory[r.playHistory.length - 1];
      const mergedHistory = lastHistory && lastHistory.snapshotType === 'generate_summary'
        ? [...r.playHistory.slice(0, -1), historyItem]
        : [...r.playHistory, historyItem];
      return {
        ...r,
        currentPlayCount: snapshotPlay,
        playHistory: mergedHistory,
        updatedAt: Date.now(),
      };
    });

    const playChanges = updatedRecords.map(r => {
      const delta = r.currentPlayCount - r.initialPlayCount;
      const deltaPercent = r.initialPlayCount > 0 ? delta / r.initialPlayCount : 0;
      return { videoId: r.videoId, delta, deltaPercent };
    });

    const videoSnapshotsMap: Record<string, VideoSnapshot> = {};
    updatedRecords.forEach(r => {
      videoSnapshotsMap[r.videoId] = r.videoSnapshot;
    });

    const playChangeMap = new Map(playChanges.map(p => [p.videoId, p]));
    const allTopGrowers: TopGrower[] = [];
    updatedRecords.forEach(r => {
      const snap = r.videoSnapshot;
      const change = playChangeMap.get(r.videoId)!;
      allTopGrowers.push({
        videoId: r.videoId,
        delta: change.delta,
        deltaPercent: change.deltaPercent,
        videoTitle: snap.title,
        videoUrl: snap.videoUrl,
        coverUrl: snap.coverUrl,
        platform: snap.platform,
        initialPlayCount: r.initialPlayCount,
        latestPlayCount: r.currentPlayCount,
        riskLevel: r.riskLevel,
      });
    });
    videos
      .filter(v => !videoSnapshotsMap[v.id])
      .forEach(v => {
        const firstSnap = allSnaps[0];
        const firstEntry = firstSnap?.entries.find(e => e.videoId === v.id);
        const initial = firstEntry ? firstEntry.playCount : Math.floor(v.playCount * 0.6);
        const delta = v.playCount - initial;
        const deltaPercent = initial > 0 ? delta / initial : 0;
        if (delta > 0) {
          allTopGrowers.push({
            videoId: v.id,
            delta,
            deltaPercent,
            videoTitle: v.title,
            videoUrl: v.videoUrl,
            coverUrl: v.coverUrl,
            platform: v.platform,
            initialPlayCount: initial,
            latestPlayCount: v.playCount,
          });
        }
      });
    const topGrowers = allTopGrowers
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);

    let positive = 0, neutral = 0, negative = 0;
    videos.forEach(v => v.hotComments.forEach(c => {
      if (c.sentiment === 'positive') positive++;
      else if (c.sentiment === 'neutral') neutral++;
      else negative++;
    }));
    if (positive + neutral + negative === 0) {
      updatedRecords.forEach(r => {
        const snap = r.videoSnapshot;
        if (snap.negativeRate > 0.5) { negative += 5; }
        else if (snap.negativeRate > 0.25) { negative += 2; neutral += 3; }
        else { positive += 3; neutral += 2; }
      });
    }
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
        const snap = r.videoSnapshot;
        return snap ? `持续监控「${snap.title.slice(0, 25)}」` : `跟进风险记录 ${r.id.slice(0, 8)}`;
      });
    if (nextFocus.length === 0) nextFocus.push('继续巡检各平台新增内容');
    if (topGrowers.length > 0) {
      nextFocus.push(`重点关注播放量激增的 Top${Math.min(3, topGrowers.length)} 条视频`);
    }

    const summary: HandoverSummary = {
      id: 's_' + generateId(),
      date: new Date().toISOString().slice(0, 10),
      shiftType,
      operatorName,
      createdAt: Date.now(),
      highRiskVideos: updatedRecords,
      playChanges,
      topGrowers,
      playSnapshots: allSnaps.slice(-10),
      videoSnapshots: videoSnapshotsMap,
      sentimentStats: {
        positive: positive / total,
        neutral: neutral / total,
        negative: negative / total,
      },
      contactedDepartments: Array.from(deptSet.values()),
      nextShiftFocus: nextFocus,
    };

    const newSummaries = [summary, ...get().summaries];
    const updatedRiskRecordsStore = get().riskRecords.map(r => {
      const updated = updatedRecords.find(u => u.id === r.id);
      return updated ? updated : r;
    });
    set({
      summaries: newSummaries,
      currentShiftSummary: summary,
      riskRecords: updatedRiskRecordsStore,
    });
    saveToStorage('summaries', newSummaries);
    saveToStorage('riskRecords', updatedRiskRecordsStore);
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
