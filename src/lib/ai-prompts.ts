export function getBaziReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下八字信息生成命理分析报告：
八字信息：${data.bazi}
五行分析：${data.wuxing}
十神分析：${data.shishen}

要求：
1. 基础命理解释
2. Big Five 人格融合分析
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a fortune-telling report based on the following BaZi information:
BaZi Information: ${data.bazi}
Five Elements Analysis: ${data.wuxing}
Ten Gods Analysis: ${data.shishen}

Requirements:
1. Basic fortune-telling explanation
2. Big Five personality integration
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Structured JSON output
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}

export function getZiweiReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下紫微斗数信息生成命理分析报告：
紫微斗数信息：${data.ziwei}
命宫分析：${data.minggong}
十二宫位：${data.shiergong}

要求：
1. 基础命理解释
2. Big Five 人格融合分析
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a fortune-telling report based on the following Zi Wei Dou Shu information:
Zi Wei Dou Shu Information: ${data.ziwei}
Ming Gong Analysis: ${data.minggong}
Twelve Palaces: ${data.shiergong}

Requirements:
1. Basic fortune-telling explanation
2. Big Five personality integration
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Structured JSON output
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}

export function getPsychologyPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下心理分析信息生成心理报告：
心理分析信息：${data.psychology}
人格特征：${data.personality}
认知模式：${data.cognition}

要求：
1. 基础心理解释
2. Big Five 人格融合分析
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a psychological report based on the following psychological analysis information:
Psychological Analysis Information: ${data.psychology}
Personality Traits: ${data.personality}
Cognitive Patterns: ${data.cognition}

Requirements:
1. Basic psychological explanation
2. Big Five personality integration
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Structured JSON output
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}