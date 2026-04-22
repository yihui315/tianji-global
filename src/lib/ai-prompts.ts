export function getBaziReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下八字信息生成命理分析报告：
八字信息：${data.bazi}
五行分析：${data.wuxing}
十神分析：${data.shishen}

要求：
1. 基础命理解释（包含五行喜忌、格局分析）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a horoscope analysis report based on the following BaZi information:
BaZi data: ${data.bazi}
Five Elements analysis: ${data.wuxing}
Ten Gods analysis: ${data.shishen}

Requirements:
1. Basic BaZi interpretation (including Five Elements preferences, pattern analysis)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}

export function getZiweiReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下紫微斗数信息生成命理分析报告：
紫微斗数信息：${data.ziwei}
主星分析：${data.zhuxing}
辅星分析：${data.fuxing}

要求：
1. 基础命理解释（包含命宫、身宫、十二宫位分析）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a horoscope analysis report based on the following Zi Wei Dou Shu information:
Zi Wei Dou Shu data: ${data.ziwei}
Main Stars analysis: ${data.zhuxing}
Auxiliary Stars analysis: ${data.fuxing}

Requirements:
1. Basic Zi Wei Dou Shu interpretation (including Palace analysis, Life Palace, Body Palace)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}

export function getPsychologyPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下心理分析信息生成心理分析报告：
心理测试结果：${data.psychology}
人格特征：${data.personality}
行为模式：${data.behavior}

要求：
1. 基础心理解释（包含人格特征分析、行为模式解读）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a psychological analysis report based on the following psychological analysis information:
Psychological test results: ${data.psychology}
Personality traits: ${data.personality}
Behavioral patterns: ${data.behavior}

Requirements:
1. Basic psychological interpretation (including personality trait analysis, behavioral pattern interpretation)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}