begin;

insert into public.fortune_remedy_rules (
  dimension,
  risk_tag,
  condition_json,
  priority,
  template_key,
  title_template,
  body_template,
  reason_template,
  action_type,
  min_tier,
  is_active
) values
  (
    'wealth',
    'impulse_spending',
    '{"riskTag": "impulse_spending", "scoreBelow": 70}'::jsonb,
    10,
    'wealth_impulse_spending_pause',
    '延后冲动消费',
    '今天先把想买的项目写下来，至少等二十四小时再决定是否需要。',
    '财富分项出现冲动消费信号，先记录预算比立即行动更稳。',
    'action',
    'free',
    true
  ),
  (
    'love',
    'communication_tension',
    '{"riskTag": "communication_tension", "scoreBelow": 72}'::jsonb,
    20,
    'love_communication_tension_boundary',
    '先确认边界再沟通',
    '把今天最想表达的一句话写短一点，只陈述感受和边界，不急着要求对方立刻回应。',
    '关系分项出现沟通压力，低强度表达比追问结论更安全。',
    'action',
    'free',
    true
  ),
  (
    'career',
    'overload',
    '{"riskTag": "overload", "scoreBelow": 68}'::jsonb,
    30,
    'career_overload_one_priority',
    '只保留一个优先级',
    '把待办拆成必须、可以延后、可以拒绝三类，今天先完成一个最小关键动作。',
    '事业分项出现过载信号，缩小范围能减少无效消耗。',
    'action',
    'free',
    true
  ),
  (
    'health',
    'low_energy',
    '{"riskTag": "low_energy", "scoreBelow": 70}'::jsonb,
    40,
    'health_low_energy_observe',
    '观察低能量时段',
    '记录今天最疲惫的时间点，补水、短暂休息，并避免把疲惫解释成失败。',
    '健康分项出现低能量信号，先做自我观察和基础照顾，不下结论。',
    'self_observation',
    'free',
    true
  ),
  (
    'wealth',
    'high_risk_decision',
    '{"riskTag": "high_risk_decision"}'::jsonb,
    5,
    'wealth_high_risk_decision_guard',
    '重大财务决定先暂停',
    '涉及借贷、投资、担保或大额支出时，今天只收集信息，不做最终决定。',
    '财富分项出现高风险决策提示，需要把行动降级为观察和咨询专业意见。',
    'disclaimer_guard',
    'free',
    true
  ),
  (
    'love',
    'emotional_reactivity',
    '{"riskTag": "emotional_reactivity", "scoreBelow": 74}'::jsonb,
    50,
    'love_emotional_reactivity_ritual',
    '给情绪一个缓冲动作',
    '回复重要消息前，先离开屏幕三分钟，写下“我真正想保护的是什么”。',
    '关系分项出现情绪反应信号，短暂缓冲能降低误伤沟通的概率。',
    'ritual_copy',
    'free',
    true
  ),
  (
    'career',
    'focus_fragmentation',
    '{"riskTag": "focus_fragmentation", "scoreBelow": 75}'::jsonb,
    60,
    'career_focus_fragmentation_timer',
    '设置二十五分钟专注块',
    '关闭多余窗口，给一个任务设置二十五分钟计时；结束后再决定下一步。',
    '事业分项出现注意力分散信号，固定时段比多线推进更容易完成。',
    'action',
    'free',
    true
  ),
  (
    'health',
    'sleep_pressure',
    '{"riskTag": "sleep_pressure", "scoreBelow": 72}'::jsonb,
    70,
    'health_sleep_pressure_wind_down',
    '提前十五分钟收尾',
    '睡前把明天第一件小事写下，然后提前十五分钟减少刺激性信息输入。',
    '健康分项出现睡眠压力信号，温和收尾有助于观察作息节奏。',
    'action',
    'free',
    true
  )
on conflict (template_key) do update set
  dimension = excluded.dimension,
  risk_tag = excluded.risk_tag,
  condition_json = excluded.condition_json,
  priority = excluded.priority,
  title_template = excluded.title_template,
  body_template = excluded.body_template,
  reason_template = excluded.reason_template,
  action_type = excluded.action_type,
  min_tier = excluded.min_tier,
  is_active = excluded.is_active,
  updated_at = now();

commit;
