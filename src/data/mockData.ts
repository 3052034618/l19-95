import type {
  Video, Comment, HotWord, Keyword, RiskRecord,
  Platform, KeywordCategory, Sentiment, RiskType, RiskLevel
} from '@/types';
import { generateId } from '@/utils/format';

// ===== 种子随机函数 =====
function mulberry32(seed: number) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260619);
function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(rand() * (max - min + 1)) + min; }
function randFloat(min: number, max: number, digits = 2): number { return Number((rand() * (max - min) + min).toFixed(digits)); }

// ===== 基础素材库 =====
const BRAND_NAMES = ['星澜科技', '星澜', 'XingLan'];
const PRODUCT_NAMES = ['星澜手机', '星澜X1', '星澜Pro', '星空耳机', '星环手表', '智能音箱'];
const STORE_NAMES = ['旗舰店', '北京国贸店', '上海陆家嘴店', '广州天河店', '深圳万象城店'];
const AMBASSADORS = ['李明轩', '张雨晴', '陈子墨', '苏晚'];
const COMPETITORS = ['紫光手机', '银河数码', '极光科技'];

const DEFAULT_KEYWORDS: Omit<Keyword, 'id' | 'createdAt'>[] = [
  { text: '星澜科技', category: 'brand' },
  { text: '星澜手机', category: 'product' },
  { text: '星澜X1', category: 'product' },
  { text: '星澜Pro', category: 'product' },
  { text: '李明轩', category: 'ambassador' },
  { text: '紫光手机', category: 'competitor' },
  { text: '旗舰店', category: 'store' },
];

const PLATFORM_WEIGHTS: { platform: Platform; weight: number }[] = [
  { platform: 'douyin', weight: 40 },
  { platform: 'kuaishou', weight: 25 },
  { platform: 'shipinhao', weight: 20 },
  { platform: 'bilibili', weight: 10 },
  { platform: 'xiaohongshu', weight: 5 },
];

function pickPlatform(): Platform {
  const total = PLATFORM_WEIGHTS.reduce((s, p) => s + p.weight, 0);
  let r = rand() * total;
  for (const p of PLATFORM_WEIGHTS) {
    r -= p.weight;
    if (r <= 0) return p.platform;
  }
  return 'douyin';
}

function pickTimeRange(hoursBack: number): number {
  const now = Date.now();
  // 加权分布：近2小时30%，2-6小时40%，6-12小时20%，12-24小时10%
  const tierRanges = [
    { max: Math.min(2, hoursBack), weight: 30 },
    { max: Math.min(6, hoursBack), weight: 40, min: 2 },
    { max: Math.min(12, hoursBack), weight: 20, min: 6 },
    { max: hoursBack, weight: 10, min: 12 },
  ].filter(t => t.max > (t.min || 0));

  const total = tierRanges.reduce((s, t) => s + t.weight, 0);
  let r = rand() * total;
  let selected = tierRanges[0];
  for (const t of tierRanges) {
    r -= t.weight;
    if (r <= 0) { selected = t; break; }
  }
  const min = (selected as any).min || 0;
  const hourOffset = randFloat(min, selected.max);
  return now - hourOffset * 3600000;
}

// ===== 视频标题模板 =====
const VIDEO_TEMPLATES = {
  positive: [
    '{product}真实体验一个月，太香了！',
    '开箱{product}，颜值直接拉满',
    '用了{brand}三年，终于等到这次升级',
    '{ambassador}同款{product}，入手不亏',
    '{brand}这次真的太懂用户了',
    '深度评测{product}：这几个点必须夸',
  ],
  neutral: [
    '{product}全方位介绍，看完再决定买不买',
    '对比评测：{product} vs {competitor}',
    '三分钟看懂{brand}新品发布会',
    '{store}探店，看看有什么好东西',
    '{product}参数详解，配置党必看',
  ],
  negative: [
    '别再吹了！{product}这些问题你遇到了吗？',
    '{product}翻车现场，质量真的堪忧',
    '吐槽{brand}售后，这态度我服了',
    '买{product}一周就出问题，踩雷了',
    '{competitor}都笑了，{product}就这？',
    '揭秘{brand}营销骗局，千万别上当',
    '{store}服务态度极差，再也不去了',
    '{ambassador}代言的{product}，真的不行',
  ],
  rumor: [
    '听说{brand}要倒闭了？员工都在裁员',
    '内部消息：{product}存在重大安全隐患',
    '爆料：{brand}质量问题被总部压下来了',
    '网传{brand}偷税漏税，真的假的？',
  ],
  competition: [
    '用了{competitor}再也不想碰{brand}',
    '{competitor}用户实测对比，{product}就是智商税',
    '懂行的都选{competitor}，{brand}就是营销好',
    '{competitor}这次把{product}按在地上摩擦',
  ],
};

const USER_NAMES = [
  '数码小王子', '科技老司机', '开箱小能手', '生活研究所', '普通消费者小王',
  '产品经理聊数码', '真实测评菌', '科技美学', '爱生活的老张', '独立评测人',
  '买前必看', '理性消费者', '数码爱好者阿明', '败家测评', '普通人的日常',
  '避坑指南', '实话实说的人', '用户真实反馈', '街头采访', '测评界的小学生',
];

const COMMENT_TEMPLATES = {
  positive: [
    '用了半年了，确实不错', '同感！我也觉得很好用', '支持一个',
    '颜值在线，性能也够用', '买了不后悔系列', '朋友推荐的，真香',
    '这波我站{brand}', '已下单，坐等收货', '用了三个月，没毛病',
  ],
  neutral: [
    '看看再说', '有说好有说坏，难选', '等降价了再考虑',
    '同价位还有其他选择吗', '续航怎么样？', '拍照效果如何？',
    '有优惠券吗？', '线下店能体验吗', '什么时候出新款',
  ],
  negative: [
    '我也遇到这个问题了', '售后真的垃圾，我深有体会',
    '幸好没买', '这质量也是服了', '再也不买这个牌子了',
    '垃圾产品，退货中', '被骗了，根本不好用',
    '客服半天不回复', '发热严重，卡死了', '充电太慢了',
  ],
};

function fillTemplate(tpl: string): string {
  return tpl
    .replace(/{brand}/g, pick(BRAND_NAMES))
    .replace(/{product}/g, pick(PRODUCT_NAMES))
    .replace(/{store}/g, pick(STORE_NAMES))
    .replace(/{ambassador}/g, pick(AMBASSADORS))
    .replace(/{competitor}/g, pick(COMPETITORS));
}

function generateComments(videoId: string, videoSentiment: Sentiment, count: number): Comment[] {
  const comments: Comment[] = [];
  const sentimentBias = videoSentiment === 'negative' ? 0.5 : videoSentiment === 'positive' ? 0.15 : 0.3;

  for (let i = 0; i < count; i++) {
    const r = rand();
    let sentiment: Sentiment;
    let templatePool: string[];

    if (r < sentimentBias) {
      sentiment = 'negative';
      templatePool = COMMENT_TEMPLATES.negative;
    } else if (r < sentimentBias + 0.35) {
      sentiment = 'positive';
      templatePool = COMMENT_TEMPLATES.positive;
    } else {
      sentiment = 'neutral';
      templatePool = COMMENT_TEMPLATES.neutral;
    }

    comments.push({
      id: generateId(),
      videoId,
      userName: pick(USER_NAMES),
      content: fillTemplate(pick(templatePool)),
      sentiment,
      likeCount: randInt(0, 500),
      createdAt: Date.now() - randInt(60000, 7200000),
    });
  }
  return comments.sort((a, b) => b.likeCount - a.likeCount);
}

function getMatchedKeywords(title: string): string[] {
  const allKeywords = [...BRAND_NAMES, ...PRODUCT_NAMES, ...STORE_NAMES, ...AMBASSADORS, ...COMPETITORS];
  return allKeywords.filter(kw => title.includes(kw));
}

function getVideoSentiment(title: string): Sentiment {
  const allNegative = [...VIDEO_TEMPLATES.negative, ...VIDEO_TEMPLATES.rumor, ...VIDEO_TEMPLATES.competition];
  if (allNegative.some(t => title.includes(t.replace(/\{[^}]+\}/g, '')) || title.includes('问题') || title.includes('翻车') || title.includes('骗') || title.includes('垃圾'))) {
    return 'negative';
  }
  if (VIDEO_TEMPLATES.positive.some(t => title.includes(t.replace(/\{[^}]+\}/g, '')) || title.includes('香') || title.includes('夸') || title.includes('值'))) {
    return 'positive';
  }
  return 'neutral';
}

// 生成封面颜色（渐变色）
const COVER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
];

function generateCover(title: string): string {
  // 使用标题的哈希值选择渐变
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % COVER_GRADIENTS.length;
  return COVER_GRADIENTS[idx];
}

const AVATAR_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

function generateAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[idx];
  const initial = name.slice(0, 1);
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-family="sans-serif">${initial}</text></svg>`)}`;
}

// ===== 公开接口 =====
export function generateDefaultKeywords(): Keyword[] {
  const now = Date.now();
  return DEFAULT_KEYWORDS.map((k, i) => ({
    id: generateId(),
    text: k.text,
    category: k.category,
    createdAt: now - i * 86400000,
  }));
}

export function generateVideos(timeRangeHours: number, count: number = 40): Video[] {
  const videos: Video[] = [];
  const allTemplates = [
    ...VIDEO_TEMPLATES.positive.map(t => ({ t, bias: 0.45 })),
    ...VIDEO_TEMPLATES.neutral.map(t => ({ t, bias: 0.35 })),
    ...VIDEO_TEMPLATES.negative.map(t => ({ t, bias: 0.12 })),
    ...VIDEO_TEMPLATES.rumor.map(t => ({ t, bias: 0.03 })),
    ...VIDEO_TEMPLATES.competition.map(t => ({ t, bias: 0.05 })),
  ];

  for (let i = 0; i < count; i++) {
    let selectedTpl = allTemplates[0];
    const r = rand();
    let acc = 0;
    for (const item of allTemplates) {
      acc += item.bias / allTemplates.filter(x => x.t === item.t).length;
      if (r <= acc) { selectedTpl = item; break; }
    }

    const title = fillTemplate(selectedTpl.t);
    const sentiment = getVideoSentiment(title);
    const platform = pickPlatform();
    const publishedAt = pickTimeRange(timeRangeHours);
    const ageHours = (Date.now() - publishedAt) / 3600000;
    const isNew = ageHours < 2;

    // 播放量：基于平台+时长加权
    const basePlay = platform === 'douyin' ? 5000 : platform === 'kuaishou' ? 3000 : platform === 'shipinhao' ? 1500 : platform === 'bilibili' ? 2000 : 800;
    const ageMultiplier = 1 + ageHours * 0.3 + randFloat(0, 2);
    const playCount = Math.floor(basePlay * ageMultiplier * randFloat(0.3, 3));
    const likeCount = Math.floor(playCount * randFloat(0.02, 0.08));
    const commentCount = Math.floor(playCount * randFloat(0.005, 0.03));
    const shareCount = Math.floor(playCount * randFloat(0.002, 0.015));

    const matchedKeywords = getMatchedKeywords(title);
    const commentList = generateComments('', sentiment, Math.min(commentCount, randInt(5, 15)))
      .map(c => ({ ...c, videoId: generateId() }));

    // 传播分：基于增长速度 + 评论量
    const velocity = ageHours < 1 ? 3 : ageHours < 3 ? 2 : 1;
    const spreadScore = Math.min(100, Math.floor(
      velocity * 15 +
      (commentCount / (playCount + 1)) * 1000 * 0.4 +
      (shareCount / (playCount + 1)) * 1000 * 0.3 +
      randInt(0, 30)
    ));

    const negativeCount = commentList.filter(c => c.sentiment === 'negative').length;
    const negativeRate = commentList.length > 0 ? negativeCount / commentList.length : 0;

    videos.push({
      id: 'v_' + generateId(),
      platform,
      title,
      coverUrl: generateCover(title),
      authorName: pick(USER_NAMES),
      authorAvatar: '',
      publishedAt,
      playCount,
      likeCount,
      commentCount,
      shareCount,
      matchedKeywords,
      spreadScore,
      negativeRate,
      hotComments: commentList,
      isNew,
    });
  }

  // 为作者头像赋值
  videos.forEach(v => { v.authorAvatar = generateAvatar(v.authorName); });
  // 修正评论videoId
  videos.forEach(v => { v.hotComments.forEach(c => { c.videoId = v.id; }); });

  // 按发布时间倒序
  return videos.sort((a, b) => b.publishedAt - a.publishedAt);
}

export function generateHotWords(videos: Video[]): HotWord[] {
  const wordFreq: Record<string, { freq: number; sentiments: number[] }> = {};

  const extraHotWords = [
    { word: '续航', sentiment: 'neutral' as Sentiment },
    { word: '发热', sentiment: 'negative' as Sentiment },
    { word: '拍照', sentiment: 'positive' as Sentiment },
    { word: '性价比', sentiment: 'neutral' as Sentiment },
    { word: '售后', sentiment: 'negative' as Sentiment },
    { word: '充电', sentiment: 'neutral' as Sentiment },
    { word: '屏幕', sentiment: 'positive' as Sentiment },
    { word: '卡顿', sentiment: 'negative' as Sentiment },
    { word: '颜值', sentiment: 'positive' as Sentiment },
    { word: '信号', sentiment: 'negative' as Sentiment },
    { word: '系统', sentiment: 'neutral' as Sentiment },
    { word: '价格', sentiment: 'neutral' as Sentiment },
    { word: '推荐', sentiment: 'positive' as Sentiment },
    { word: '翻车', sentiment: 'negative' as Sentiment },
    { word: '假货', sentiment: 'negative' as Sentiment },
  ];

  // 从评论提取 + 额外热词
  for (const v of videos) {
    for (const c of v.hotComments) {
      for (const hw of extraHotWords) {
        if (c.content.includes(hw.word)) {
          if (!wordFreq[hw.word]) wordFreq[hw.word] = { freq: 0, sentiments: [] };
          wordFreq[hw.word].freq++;
          wordFreq[hw.word].sentiments.push(c.sentiment === 'negative' ? -1 : c.sentiment === 'positive' ? 1 : 0);
        }
      }
    }
  }

  // 保底频次
  extraHotWords.forEach(hw => {
    if (!wordFreq[hw.word]) {
      wordFreq[hw.word] = { freq: randInt(3, 20), sentiments: [hw.sentiment === 'negative' ? -1 : hw.sentiment === 'positive' ? 1 : 0] };
    }
  });

  const result: HotWord[] = Object.entries(wordFreq).map(([word, data]) => {
    const avgSentiment = data.sentiments.reduce((s, v) => s + v, 0) / data.sentiments.length;
    let sentiment: Sentiment = 'neutral';
    if (avgSentiment > 0.15) sentiment = 'positive';
    else if (avgSentiment < -0.15) sentiment = 'negative';
    return {
      word,
      frequency: data.freq + randInt(2, 15),
      sentiment,
    };
  });

  return result.sort((a, b) => b.frequency - a.frequency);
}

// ===== 生成示例风险记录 =====
export function generateSampleRiskRecords(videos: Video[]): RiskRecord[] {
  const highRiskVideos = videos
    .filter(v => v.negativeRate > 0.35 || v.spreadScore > 80)
    .slice(0, 3);

  const riskTypes: RiskType[] = ['complaint', 'rant', 'rumor', 'parody', 'competition'];
  const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'urgent'];
  const operators = ['张伟-PR', '李娜-PR', '王磊-PR'];
  const opinions = [
    '评论区负面情绪集中，存在扩散风险，建议客服跟进',
    '标题具有误导性，可能误导消费者，需评估是否发函',
    '传播速度异常，2小时破万播放，需密切监控',
    '涉及不实信息，建议法务介入评估处理方案',
    '疑似竞品水军带节奏，评论区有组织性负面',
  ];

  return highRiskVideos.map((v, i) => {
    const riskLevel = i === 0 ? 'urgent' : riskLevels[randInt(1, 3)];
    return {
      id: 'r_' + generateId(),
      videoId: v.id,
      riskType: pick(riskTypes),
      riskLevel,
      opinion: opinions[i % opinions.length],
      contactDepartments: i === 0 ? ['customer_service', 'legal'] : i === 1 ? ['marketing'] : ['product'],
      status: i === 2 ? 'resolved' : i === 1 ? 'processing' : 'pending',
      handleNotes: [
        i === 0 ? '15:30 已联系客服主管，排查该用户订单' : '',
        i === 1 ? '16:00 市场部正在准备回应口径' : '',
      ].filter(Boolean),
      initialPlayCount: Math.floor(v.playCount * 0.6),
      currentPlayCount: v.playCount,
      createdAt: v.publishedAt + randInt(600000, 3600000),
      updatedAt: Date.now() - randInt(600000, 7200000),
      operator: operators[i % operators.length],
    };
  });
}
