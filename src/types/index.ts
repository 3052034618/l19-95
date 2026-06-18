export type Platform = 'douyin' | 'kuaishou' | 'shipinhao' | 'bilibili' | 'xiaohongshu';
export type RiskType = 'complaint' | 'rant' | 'rumor' | 'parody' | 'competition' | 'safe';
export type RiskLevel = 'low' | 'medium' | 'high' | 'urgent';
export type HandleStatus = 'pending' | 'processing' | 'resolved';
export type Department = 'customer_service' | 'legal' | 'product' | 'marketing' | 'store';
export type KeywordCategory = 'brand' | 'product' | 'store' | 'ambassador' | 'competitor';
export type ShiftType = 'morning' | 'evening';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Keyword {
  id: string;
  text: string;
  category: KeywordCategory;
  createdAt: number;
}

export interface Comment {
  id: string;
  videoId: string;
  userName: string;
  content: string;
  sentiment: Sentiment;
  likeCount: number;
  createdAt: number;
}

export interface Video {
  id: string;
  platform: Platform;
  title: string;
  coverUrl: string;
  videoUrl: string;
  authorName: string;
  authorAvatar: string;
  publishedAt: number;
  playCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  matchedKeywords: string[];
  spreadScore: number;
  negativeRate: number;
  hotComments: Comment[];
  isNew: boolean;
}

export interface HotWord {
  word: string;
  frequency: number;
  sentiment: Sentiment;
}

export interface RiskRecord {
  id: string;
  videoId: string;
  riskType: RiskType;
  riskLevel: RiskLevel;
  opinion: string;
  contactDepartments: Department[];
  status: HandleStatus;
  handleNotes: string[];
  initialPlayCount: number;
  currentPlayCount: number;
  createdAt: number;
  updatedAt: number;
  operator: string;
}

export interface PlayChange {
  videoId: string;
  delta: number;
  deltaPercent: number;
}

export interface ContactedDept {
  dept: Department;
  points: string;
  responsible: string;
}

export interface HandoverSummary {
  id: string;
  date: string;
  shiftType: ShiftType;
  operatorName: string;
  createdAt: number;
  highRiskVideos: RiskRecord[];
  playChanges: PlayChange[];
  sentimentStats: { positive: number; neutral: number; negative: number };
  contactedDepartments: ContactedDept[];
  nextShiftFocus: string[];
  confirmedBy?: string;
}

export interface InspectionConfig {
  keywords: Keyword[];
  platforms: Platform[];
  timeRangeHours: number;
}

export interface CreateRiskPayload {
  videoId: string;
  riskType: RiskType;
  riskLevel: RiskLevel;
  opinion: string;
  operator: string;
}

export const PLATFORM_META: Record<Platform, { name: string; color: string; icon: string; urlPrefix: string }> = {
  douyin: { name: '抖音', color: '#000000', icon: '🎵', urlPrefix: 'https://www.douyin.com/video/' },
  kuaishou: { name: '快手', color: '#FF4906', icon: '⚡', urlPrefix: 'https://www.kuaishou.com/short-video/' },
  shipinhao: { name: '视频号', color: '#07C160', icon: '📱', urlPrefix: 'https://channels.weixin.qq.com/' },
  bilibili: { name: 'B站', color: '#FB7299', icon: '📺', urlPrefix: 'https://www.bilibili.com/video/' },
  xiaohongshu: { name: '小红书', color: '#FE2C55', icon: '📕', urlPrefix: 'https://www.xiaohongshu.com/explore/' },
};

export const RISK_TYPE_META: Record<RiskType, { name: string; emoji: string; color: string }> = {
  complaint: { name: '用户投诉', emoji: '😤', color: 'text-risk-urgent' },
  rant: { name: '产品吐槽', emoji: '🤬', color: 'text-risk-high' },
  rumor: { name: '不实谣言', emoji: '👻', color: 'text-purple-400' },
  parody: { name: '恶搞剪辑', emoji: '🎭', color: 'text-risk-medium' },
  competition: { name: '竞品带节奏', emoji: '⚔️', color: 'text-orange-400' },
  safe: { name: '无风险', emoji: '✅', color: 'text-risk-low' },
};

export const RISK_LEVEL_META: Record<RiskLevel, { name: string; color: string; bg: string; border: string }> = {
  urgent: { name: '紧急', color: 'text-white', bg: 'bg-risk-urgent', border: 'border-risk-urgent' },
  high: { name: '高风险', color: 'text-white', bg: 'bg-risk-high', border: 'border-risk-high' },
  medium: { name: '中风险', color: 'text-white', bg: 'bg-risk-medium', border: 'border-risk-medium' },
  low: { name: '低风险', color: 'text-white', bg: 'bg-risk-low', border: 'border-risk-low' },
};

export const STATUS_META: Record<HandleStatus, { name: string; color: string; bg: string }> = {
  pending: { name: '待处理', color: 'text-risk-urgent', bg: 'bg-risk-urgent/10' },
  processing: { name: '处理中', color: 'text-risk-medium', bg: 'bg-risk-medium/10' },
  resolved: { name: '已解决', color: 'text-risk-low', bg: 'bg-risk-low/10' },
};

export const DEPT_META: Record<Department, { name: string; color: string; emoji: string }> = {
  customer_service: { name: '客服部', color: 'bg-blue-500/20 text-blue-300', emoji: '🎧' },
  legal: { name: '法务部', color: 'bg-purple-500/20 text-purple-300', emoji: '⚖️' },
  product: { name: '产品部', color: 'bg-green-500/20 text-green-300', emoji: '📦' },
  marketing: { name: '市场部', color: 'bg-pink-500/20 text-pink-300', emoji: '📣' },
  store: { name: '门店运营', color: 'bg-orange-500/20 text-orange-300', emoji: '🏪' },
};

export const KEYWORD_CATEGORY_META: Record<KeywordCategory, { name: string; color: string; bg: string }> = {
  brand: { name: '品牌名', color: 'text-blue-300', bg: 'bg-keyword-brand/20 border-keyword-brand/40' },
  product: { name: '产品别称', color: 'text-purple-300', bg: 'bg-keyword-product/20 border-keyword-product/40' },
  store: { name: '门店简称', color: 'text-green-300', bg: 'bg-keyword-store/20 border-keyword-store/40' },
  ambassador: { name: '代言人', color: 'text-pink-300', bg: 'bg-keyword-ambassador/20 border-keyword-ambassador/40' },
  competitor: { name: '竞品词', color: 'text-red-300', bg: 'bg-keyword-competitor/20 border-keyword-competitor/40' },
};

export const SHIFT_META: Record<ShiftType, { name: string; time: string; icon: string }> = {
  morning: { name: '早班', time: '08:00 - 18:00', icon: '🌅' },
  evening: { name: '晚班', time: '18:00 - 次日08:00', icon: '🌙' },
};
