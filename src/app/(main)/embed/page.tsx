'use client';

import { useState, useCallback } from 'react';
import BaseWidget from '@/components/widgets/BaseWidget';
import type { WidgetType } from '@/components/widgets/BaseWidget';

const WIDGET_TYPES: {
  type: WidgetType;
  name: string;
  nameZh: string;
  description: string;
  params: Record<string, string>;
}[] = [
  {
    type: 'bazi-wheel',
    name: 'BaZi Wheel',
    nameZh: '八字命盘',
    description: 'Four Pillars of Destiny wheel chart',
    params: { birthDate: '2000-08-16', birthTime: '02:00', name: 'Demo', gender: 'male' },
  },
  {
    type: 'ziwei-palace',
    name: 'ZiWei Palace',
    nameZh: '紫微斗数',
    description: 'Purple Star palace chart',
    params: { birthDate: '2000-08-16', birthTime: '2', name: 'Demo', gender: 'male', birthdayType: 'solar' },
  },
  {
    type: 'tarot-card',
    name: 'Tarot Card',
    nameZh: '塔罗牌',
    description: 'Single tarot card widget',
    params: { birthDate: '2024-01-01', name: 'Tarot Reading' },
  },
  {
    type: 'synastry-chart',
    name: 'Synastry Chart',
    nameZh: '合盘分析',
    description: 'Relationship synastry overlay',
    params: { name: 'Person A & B' },
  },
];

function buildIframeCode(type: WidgetType, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return `<iframe src="/widget/${type}?${query}" width="400" height="400" frameborder="0"></iframe>`;
}

function buildNpmCode(type: WidgetType): string {
  return `import BaseWidget from '@tianji/widgets';

<BaseWidget
  type="${type}"
  params={{ birthDate: "2000-08-16", birthTime: "02:00", name: "Your Name" }}
  width={400}
  height={400}
/>`;
}

function CopyButton({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
      }`}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

export default function EmbedPage() {
  const [selectedType, setSelectedType] = useState<WidgetType>('bazi-wheel');
  const [customParams, setCustomParams] = useState({
    birthDate: '2000-08-16',
    birthTime: '02:00',
    name: 'Demo User',
    gender: 'male',
  });

  const selectedWidget = WIDGET_TYPES.find((w) => w.type === selectedType)!;
  const iframeCode = buildIframeCode(selectedType, customParams);
  const npmCode = buildNpmCode(selectedType);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            Embeddable Widgets
          </h1>
          <p className="text-slate-400 text-lg">
            天机全球 · TianJi Global · 嵌入组件
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Add interactive fortune charts to any website with a single iframe or npm install
          </p>
        </div>

        {/* Widget Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {WIDGET_TYPES.map((widget) => (
            <button
              key={widget.type}
              onClick={() => setSelectedType(widget.type)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedType === widget.type
                  ? 'border-purple-500 bg-purple-900/40'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              <div className="text-purple-400 text-xs font-medium mb-1">{widget.nameZh}</div>
              <div className="font-bold text-white">{widget.name}</div>
              <div className="text-slate-400 text-xs mt-1">{widget.description}</div>
            </button>
          ))}
        </div>

        {/* Live Preview + Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Live Preview */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-purple-300 mb-4">Live Preview</h2>
            <div className="flex items-center justify-center bg-slate-900/80 rounded-lg p-4 min-h-[420px]">
              <BaseWidget
                type={selectedType}
                params={selectedWidget.type === 'ziwei-palace' ? { ...customParams, birthTime: customParams.birthTime.split(':')[0], birthdayType: 'solar' } : customParams}
                width={360}
                height={360}
              />
            </div>
            <p className="text-slate-500 text-xs text-center mt-3">
              Interactive preview · Updates in real-time
            </p>
          </div>

          {/* Code Snippets */}
          <div className="space-y-4">
            {/* iframe Code */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-amber-400">iframe Embed</h3>
                <CopyButton code={iframeCode} label="Copy iframe" />
              </div>
              <pre className="bg-slate-900 rounded-lg p-3 text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {iframeCode}
              </pre>
            </div>

            {/* npm / React Code */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-purple-400">React / npm</h3>
                  <p className="text-slate-500 text-xs mt-1">For React/Next.js projects</p>
                </div>
                <CopyButton code={npmCode} label="Copy code" />
              </div>
              <pre className="bg-slate-900 rounded-lg p-3 text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {npmCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Parameter Customization */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700/50">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Customize Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-1.5">
                Birth Date
              </label>
              <input
                type="date"
                value={customParams.birthDate}
                onChange={(e) => setCustomParams((p) => ({ ...p, birthDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-1.5">
                Birth Time
              </label>
              <input
                type="time"
                value={customParams.birthTime}
                onChange={(e) => setCustomParams((p) => ({ ...p, birthTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-1.5">
                Name / Label
              </label>
              <input
                type="text"
                value={customParams.name}
                onChange={(e) => setCustomParams((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-1.5">
                Gender
              </label>
              <select
                value={customParams.gender}
                onChange={(e) => setCustomParams((p) => ({ ...p, gender: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700/50">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Widget Parameters</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-2 pr-4">Parameter</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Default</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 pr-4 font-mono text-amber-300">birthDate</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">2000-08-16</td>
                  <td>Birth date in YYYY-MM-DD format</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 pr-4 font-mono text-amber-300">birthTime</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">02:00</td>
                  <td>Birth time in HH:MM 24-hour format</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 pr-4 font-mono text-amber-300">name</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">(empty)</td>
                  <td>Display name shown on the widget</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 pr-4 font-mono text-amber-300">gender</td>
                  <td className="py-2 pr-4">male | female</td>
                  <td className="py-2 pr-4">male</td>
                  <td>Gender for chart calculations</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-amber-300">birthdayType</td>
                  <td className="py-2 pr-4">solar | lunar</td>
                  <td className="py-2 pr-4">solar</td>
                  <td>Calendar type for ZiWei palace</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget Type Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {WIDGET_TYPES.map((widget) => (
            <div
              key={widget.type}
              className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{widget.name}</h3>
                    <span className="text-purple-400 text-sm">·</span>
                    <span className="text-slate-400 text-sm">{widget.nameZh}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{widget.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono">
                      /widget/{widget.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm">
          <p>© 2024 TianJi Global · 天机全球 · Embed System v1.0</p>
        </div>
      </div>
    </main>
  );
}
