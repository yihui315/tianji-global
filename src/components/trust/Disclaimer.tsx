interface DisclaimerProps {
  compact?: boolean;
  className?: string;
}

export default function Disclaimer({ compact = false, className = '' }: DisclaimerProps) {
  return (
    <aside
      className={`rounded-2xl border border-white/10 bg-white/[0.045] ${
        compact ? 'p-4 text-xs' : 'p-5 text-sm'
      } leading-6 text-white/62 ${className}`}
    >
      <p>
        TianJi Love is for self-reflection and relationship guidance. It offers interpretive patterns and timing
        prompts, not guaranteed predictions, and it is not medical, legal, or financial advice.
      </p>
    </aside>
  );
}
