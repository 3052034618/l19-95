import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { KEYWORD_CATEGORY_META, KeywordCategory } from '@/types';
import { cn } from '@/lib/utils';

const categories: { key: KeywordCategory; name: string }[] = [
  { key: 'brand', name: KEYWORD_CATEGORY_META.brand.name },
  { key: 'product', name: KEYWORD_CATEGORY_META.product.name },
  { key: 'store', name: KEYWORD_CATEGORY_META.store.name },
  { key: 'ambassador', name: KEYWORD_CATEGORY_META.ambassador.name },
  { key: 'competitor', name: KEYWORD_CATEGORY_META.competitor.name },
];

export default function KeywordManager() {
  const keywords = useAppStore(s => s.config.keywords);
  const addKeyword = useAppStore(s => s.addKeyword);
  const removeKeyword = useAppStore(s => s.removeKeyword);

  const [inputText, setInputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<KeywordCategory>('brand');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    const text = inputText.trim();
    if (!text) return;
    addKeyword(text, activeCategory);
    setInputText('');
    setShowInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setShowInput(false); setInputText(''); }
  };

  return (
    <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-slate-200">巡检关键词清单</h3>
          <span className="text-[11px] text-monitor-muted font-mono">{keywords.length} 个</span>
        </div>
        <button
          onClick={() => setShowInput(v => !v)}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
            showInput
              ? 'bg-monitor-border text-slate-200'
              : 'bg-brand-blue/15 text-brand-blue hover:bg-brand-blue/25'
          )}
        >
          <Plus size={14} className={cn(showInput && 'rotate-45 transition-transform')} />
          {showInput ? '取消' : '添加关键词'}
        </button>
      </div>

      {/* 添加输入框 */}
      {showInput && (
        <div className="mb-4 p-3 rounded-md bg-monitor-bg border border-monitor-border animate-fade-in">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border',
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

      {/* 关键词列表 */}
      {keywords.length === 0 ? (
        <div className="text-center py-8 text-monitor-muted text-sm">
          暂无关键词，点击上方按钮添加
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => {
            const items = keywords.filter(k => k.category === cat.key);
            if (items.length === 0) return null;
            return (
              <div key={cat.key} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
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
                  <span className="text-[11px] text-monitor-muted">{items.length}</span>
                </div>
                <div className="flex flex-wrap gap-2 animate-stagger">
                  {items.map(kw => (
                    <div
                      key={kw.id}
                      className={cn(
                        'group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 hover:shadow-md',
                        KEYWORD_CATEGORY_META[cat.key].bg,
                        KEYWORD_CATEGORY_META[cat.key].color,
                        KEYWORD_CATEGORY_META[cat.key].bg.replace('/20', '/30')
                      )}
                      style={{ borderColor: 'currentColor', opacity: 0.85 }}
                    >
                      <span>{kw.text}</span>
                      <button
                        onClick={() => removeKeyword(kw.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1 hover:bg-black/20 rounded p-0.5"
                      >
                        <X size={12} />
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
