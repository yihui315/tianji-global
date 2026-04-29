import type { CSSProperties } from 'react';

import {
  planSmartTitle,
  tokenizeSmartTitle,
  type SmartTitleLang,
  type SmartTitlePriority,
} from '@/lib/smart-title';

type SmartTitleTag = 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';

export interface SmartTitleProps {
  as?: SmartTitleTag;
  text: string;
  lang?: SmartTitleLang;
  maxLines?: 1 | 2 | 3;
  priority?: SmartTitlePriority;
  align?: 'left' | 'center';
  className?: string;
  style?: CSSProperties;
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export default function SmartTitle({
  as: Tag = 'h2',
  text,
  lang = 'auto',
  maxLines,
  priority = 'section',
  align = 'left',
  className,
  style,
}: SmartTitleProps) {
  const plan = planSmartTitle(text, { lang, maxLines, priority });
  const titleStyle = {
    '--tj-title-max-ch': `${plan.maxCh}ch`,
    ...style,
  } as CSSProperties;

  return (
    <Tag
      className={cx(
        plan.utilityClass,
        align === 'center' && 'tj-smart-title-center',
        className
      )}
      data-smart-title-lang={plan.lang}
      lang={plan.lang === 'zh' ? 'zh-Hans' : plan.lang === 'en' ? 'en' : undefined}
      style={titleStyle}
    >
      {plan.segments.map((segment, segmentIndex) => (
        <span className="tj-smart-title-line" key={`${segment}-${segmentIndex}`}>
          {tokenizeSmartTitle(segment).map((token, tokenIndex) => (
            <span
              className={token.kind === 'latin' ? 'tj-smart-title-token-latin' : undefined}
              data-smart-title-token={token.kind}
              key={`${token.text}-${segmentIndex}-${tokenIndex}`}
          >
            {token.text}
          </span>
        ))}
        </span>
      ))}
    </Tag>
  );
}
