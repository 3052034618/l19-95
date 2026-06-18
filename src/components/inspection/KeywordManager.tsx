import { useState } from 'react';
import { Plus, X, Tag, Download, Upload, CheckCircle2, XCircle, Power } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { KEYWORD_CATEGORY_META, type KeywordCategory } from '@/types';
import { cn } from '@/lib/utils';

const ALL_CATEGORY: KeywordCategory | 'all' = 'all';
const categories: { key: KeywordCategory; name: string }[] = [
  { key: 'brand', name: KEYWORD_CATEGORY_META.brand.name },
  { key: 'product', name: KEYWORD_CATEGORY_META.product.name },
  { key: 'store', name: KEYWORD_CATEGORY_META.store.name },
  { key: 'ambassador', name: KEYWORD_CATEGORY_META.ambassador.name },
  { key: 'competitor', name: KEYWORD_CATEGORY_META.competitor.name },
];

const categoryParseMap: Record<string, KeywordCategory> = {
  '品牌名': 'brand', '品牌': 'brand', 'brand': 'brand', 'BRAND': 'brand',
  '产品别称': 'product', '产品': 'product', 'product': 'product',
  '门店简称': 'store', '门店': 'store', 'store': 'store',
  '代言人': 'ambassador', '代言': 'ambassador', 'ambassador': 'ambassador',
  '竞品词': 'competitor', '竞品': 'competitor', 'competitor': 'competitor',
};

export default function KeywordManager() {
  const keywords = useAppStore(s => s.config.keywords);
  const addKeyword = useAppStore(s => s.addKeyword);
  const removeKeyword = useAppStore(s => s.removeKeyword);
  const toggleKeyword = useAppStore(s => s.toggleKeyword);
  const toggleCategoryKeywords = useAppStore(s => s.toggleCategoryKeywords);
  const importKeywords = useAppStore(s => s.importKeywords);
  const exportKeywords = useAppStore(s => s.exportKeywords);

  const [filterCategory, setFilterCategory] = useState<KeywordCategory | typeof ALL_CATEGORY>(ALL_CATEGORY);
  const [activeCategory, setActiveCategory] = useState<KeywordCategory>('brand');
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);

  const totalEnabled = keywords.filter(k => k.enabled).length;
  const visibleCategories = categories.filter(c => filterCategory === ALL_CATEGORY || c.key === filterCategory);
  const visibleKeywordCount = filterCategory === ALL_CATEGORY
    ? keywords.length
    : keywords.filter(k => k.category === filterCategory).length;

  const handleAdd = () => {
    const text = inputText.trim();
    if (!text) return;
    addKeyword(text, activeCategory);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setShowInput(false); setInputText(''); }
  };

  const handleExport = () => {
    const blob = new Blob([exportKeywords()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `巡检关键词_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const items: { text: string; category: KeywordCategory }[] = [];
    importText.split(/\r?\n/).forEach((line, idx) => {
      if (idx === 0 && /关键词|类别|状态/.test(line)) return;
      const parts = line.split(/[\t,，;；]/).map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return;
      const text = parts[0];
      let cat: KeywordCategory = 'brand';
      if (parts[1]) cat = categoryParseMap[parts[1]] || activeCategory;
      if (text) items.push({ text, category: cat });
    });
    const res = importKeywords(items);
    setImportResult(res);
    setTimeout(() => { setImportResult(null); setShowImport(false); setImportText(''); }, 1800);
  };

  const getCategoryCounts = (cat: KeywordCategory) => {
    const list = keywords.filter(k => k.category === cat);
    return { total: list.length, enabled: list.filter(k => k.enabled).length };
  };

  return (
    <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-slate-200">巡检关键词清单</h3>
          <span className="text-[11px] text-monitor-muted font-mono">
            启用 {totalEnabled}/{keywords.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 transition-all"
            title="导出关键词到TXT"
          >
            <Download size={13} />
            导出
          </button>
          <button
            onClick={() => { setShowImport(v => !v); setImportResult(null); }}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border transition-all',
              showImport
                ? 'bg-monitor-border text-slate-200 border-monitor-border'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/50'
            )}
            title="批量导入关键词（每行一个，格式：关键词[TAB]类别）"
          >
            <Upload size={13} />
            导入
          </button>
          <div className="w-px h-5 bg-slate-700 mx-0.5" />
          <button
            onClick={() => setShowInput(v => !v)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
              showInput
                ? 'bg-monitor-border text-slate-200'
                : 'bg-brand-blue/15 text-brand-blue hover:bg-brand-blue/25'
            )}
          >
            <Plus size={13} className={cn(showInput && 'rotate-45 transition-transform')} />
            {showInput ? '取消' : '添加关键词'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterCategory(ALL_CATEGORY)}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs border transition-all',
            filterCategory === ALL_CATEGORY
              ? 'bg-slate-100/10 text-slate-200 border-white/20'
              : 'text-monitor-muted border-monitor-border hover:text-slate-300 hover:border-slate-500'
          )}
        >
          全部
          <span className="ml-1.5 text-[10px] font-mono opacity-60">{keywords.length}</span>
        </button>
        {categories.map(cat => {
          const { total, enabled } = getCategoryCounts(cat.key);
          const isActive = filterCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(isActive ? ALL_CATEGORY : cat.key)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs border transition-all',
                isActive
                  ? `${KEYWORD_CATEGORY_META[cat.key].bg} ${KEYWORD_CATEGORY_META[cat.key].color} border-current`
                  : 'bg-transparent border-monitor-border text-monitor-muted hover:text-slate-300 hover:border-slate-500'
              )}
            >
              {cat.name}
              <span className="ml-1.5 text-[10px] font-mono opacity-60">
                {enabled}/{total}
              </span>
            </button>
          );
        })}
      </div>

      {showImport && (
        <div className="mb-4 p-3 rounded-md bg-monitor-bg border border-monitor-border animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400">
              每行一个关键词，格式：<code className="text-brand-blue text-[11px]">关键词[TAB]类别</code>，类别可填「品牌名/产品别称/门店简称/代言人/竞品词」，默认归为当前选中类
            </p>
          </div>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            rows={4}
            placeholder="星耀奶茶	品牌名&#10;小星星	产品别称&#10;朝阳大悦城店	门店简称&#10;张三	代言人&#10;茶对面	竞品词"
            className="w-full input-base resize-none mb-2 font-mono text-xs"
          />
          <div className="flex items-center justify-between">
            {importResult && (
              <div className="flex items-center gap-3 text-xs animate-fade-in">
                <span className="flex items-center gap-1 text-risk-low">
                  <CheckCircle2 size={13} /> 新增 {importResult.added}
                </span>
                {importResult.skipped > 0 && (
                  <span className="flex items-center gap-1 text-risk-medium">
                    <XCircle size={13} /> 跳过 {importResult.skipped}（已存在/空行）
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <div className="flex rounded-md overflow-hidden border border-slate-700/50">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      'px-2 py-1 text-[11px] transition-all',
                      activeCategory === cat.key
                        ? `${KEYWORD_CATEGORY_META[cat.key].bg} ${KEYWORD_CATEGORY_META[cat.key].color}`
                        : 'bg-slate-800/40 text-slate-500 hover:text-slate-300'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowImport(false); setImportText(''); setImportResult(null); }}
                className="px-3 py-1.5 rounded-md text-xs bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="px-3 py-1.5 rounded-md text-xs btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {showInput && (
        <div className="mb-4 p-3 rounded-md bg-monitor-bg border border-monitor-border animate-fade-in">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border',
                  activeCategory === cat.key
                    ? `${KEYWORD_CATEGORY_META[cat.key].bg} ${KEYWORD_CATEGORY_META[cat.key].color} border-current`
                    : 'bg-transparent border-monitor-border text-monitor-muted hover:text-slate-300 hover:border-slate-500'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              autoFocus
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`输入${KEYWORD_CATEGORY_META[activeCategory].name}，按回车确认`}
              className="flex-1 input-base"
            />
            <button onClick={handleAdd} className="btn-primary text-sm py-2 px-4">
              添加
            </button>
          </div>
        </div>
      )}

      {keywords.length === 0 ? (
        <div className="text-center py-8 text-monitor-muted text-sm">
          暂无关键词，点击右上角「添加关键词」或「导入」批量录入
        </div>
      ) : visibleKeywordCount === 0 ? (
        <div className="text-center py-6 text-monitor-muted text-xs">
          当前筛选类别下暂无关键词，切换上方分类或添加新的词
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {visibleCategories.map(cat => {
            const items = keywords.filter(k => k.category === cat.key);
            if (items.length === 0) return null;
            const { total, enabled } = getCategoryCounts(cat.key);
            const allEnabled = total === enabled;
            const allDisabled = enabled === 0;
            return (
              <div key={cat.key} className="animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-1 h-4 rounded',
                      cat.key === 'brand' && 'bg-keyword-brand',
                      cat.key === 'product' && 'bg-keyword-product',
                      cat.key === 'store' && 'bg-keyword-store',
                      cat.key === 'ambassador' && 'bg-keyword-ambassador',
                      cat.key === 'competitor' && 'bg-keyword-competitor',
                    )} />
                    <span className={`text-xs font-medium ${KEYWORD_CATEGORY_META[cat.key].color}`}>
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-monitor-muted">{enabled}/{total}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCategoryKeywords(cat.key, !allEnabled)}
                      className={cn(
                        'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-all hover:bg-slate-700/50',
                        allEnabled
                          ? 'text-risk-low hover:text-risk-low/80'
                          : allDisabled
                            ? 'text-slate-500 hover:text-slate-400'
                            : 'text-risk-medium hover:text-risk-medium/80'
                      )}
                      title={allEnabled ? '一键停用本类' : '一键启用本类'}
                    >
                      <Power size={10} />
                      {allEnabled ? '全停用' : allDisabled ? '全启用' : '全启用'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 animate-stagger">
                  {items.map(kw => (
                    <div
                      key={kw.id}
                      className={cn(
                        'group relative inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md text-xs font-medium border transition-all duration-200 hover:shadow-md',
                        kw.enabled
                          ? `${KEYWORD_CATEGORY_META[cat.key].bg} ${KEYWORD_CATEGORY_META[cat.key].color}`
                          : 'bg-slate-800/30 text-slate-500 border-slate-700/40 line-through decoration-slate-600/50'
                      )}
                      style={{ borderColor: kw.enabled ? 'currentColor' : undefined, opacity: kw.enabled ? 0.9 : 0.55 }}
                    >
                      <button
                        onClick={() => toggleKeyword(kw.id)}
                        className={cn(
                          'w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all',
                          kw.enabled
                            ? 'border-current bg-current/30 text-transparent hover:bg-current/50'
                            : 'border-slate-600 hover:border-slate-500'
                        )}
                        title={kw.enabled ? '点击停用' : '点击启用'}
                      >
                        {kw.enabled && <span className="w-1.5 h-1.5 rounded-full bg-white/90" />}
                      </button>
                      <span>{kw.text}</span>
                      <button
                        onClick={() => removeKeyword(kw.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20 rounded p-0.5"
                        title="删除"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
