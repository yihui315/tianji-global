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

免责声明：本报告仅供参考，不构成任何专业命理或心理建议。`
    : `Please generate a horoscope analysis report based on the following BaZi information:
BaZi Information: ${data.bazi}
Five Elements Analysis: ${data.wuxing}
Ten Gods Analysis: ${data.shishen}

Requirements:
1. Basic BaZi interpretation (including five elements preferences, palace analysis)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional fortune-telling or psychological advice.`;

  return basePrompt;
}

export function getZiweiReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下紫微斗数信息生成命理分析报告：
紫微斗数信息：${data.ziwei}
命宫：${data.minggong}
身宫：${data.shenggong}
十二宫位分析：${data.shiergong}

要求：
1. 基础命理解释（包含命宫分析、十二宫位解读）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业命理或心理建议。`
    : `Please generate a horoscope analysis report based on the following ZiWei Dou Shu information:
ZiWei Dou Shu Information: ${data.ziwei}
Ming Gong: ${data.minggong}
Sheng Gong: ${data.shenggong}
Twelve Palaces Analysis: ${data.shiergong}

Requirements:
1. Basic ZiWei interpretation (including Ming Gong analysis, twelve palaces interpretation)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional fortune-telling or psychological advice.`;

  return basePrompt;
}

export function getPsychologyPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下心理测评信息生成心理分析报告：
测评信息：${data.psychology}
性格特征：${data.personality}
情绪状态：${data.emotions}
认知模式：${data.cognition}

要求：
1. 基础心理分析（包含性格特征、情绪状态解读）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. 认知行为疗法(CBT)建议
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业心理建议。`
    : `Please generate a psychological analysis report based on the following psychological assessment information:
Assessment Information: ${data.psychology}
Personality Traits: ${data.personality}
Emotional State: ${data.emotions}
Cognitive Patterns: ${data.cognition}

Requirements:
1. Basic psychological analysis (including personality traits, emotional state interpretation)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. Cognitive Behavioral Therapy (CBT) recommendations
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional psychological advice.`;

  return basePrompt;
}