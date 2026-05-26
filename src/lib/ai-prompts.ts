export function getBaziReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请根据以下八字信息生成命理分析报告：
八字信息：${data.bazi}
五行分析：${data.wuxing}
日主强弱：${data.rizhu}
用神分析：${data.yongshen}

要求：
1. 基础命理解释（包含日主分析、五行平衡、大运流年）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. CBT建议（认知行为疗法建议）
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业命理或心理建议。`
    : `Please generate a BaZi (Eight Characters) analysis report based on the following information:
BaZi data: ${data.bazi}
Five Elements analysis: ${data.wuxing}
Day Master strength: ${data.rizhu}
Use Element analysis: ${data.yongshen}

Requirements:
1. Basic BaZi interpretation (including Day Master analysis, Five Elements balance, major periods)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. CBT recommendations (Cognitive Behavioral Therapy suggestions)
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional BaZi or psychological advice.`;

  return basePrompt;
}

export function getZiweiReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请根据以下紫微斗数信息生成命理分析报告：
紫微斗数信息：${data.ziwei}
命宫：${data.minggong}
身宫：${data.shenggong}
十二宫位分析：${data.shiergong}
星曜分布：${data.xingyao}

要求：
1. 基础紫微斗数解释（包含命宫分析、十二宫位解读、星曜影响）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. CBT建议（认知行为疗法建议）
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业命理或心理建议。`
    : `Please generate a Zi Wei Dou Shu (Purple Star) analysis report based on the following information:
Zi Wei Dou Shu data: ${data.ziwei}
Ming Gong: ${data.minggong}
Sheng Gong: ${data.shenggong}
Twelve Palaces analysis: ${data.shiergong}
Star distribution: ${data.xingyao}

Requirements:
1. Basic Zi Wei Dou Shu interpretation (including Ming Gong analysis, twelve palaces interpretation, star influences)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. CBT recommendations (Cognitive Behavioral Therapy suggestions)
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional Zi Wei Dou Shu or psychological advice.`;

  return basePrompt;
}

export function getPsychologyPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请根据以下心理测评信息生成心理分析报告：
测评类型：${data.type}
测评结果：${data.results}
性格特征：${data.personality}
行为模式：${data.behavior}

要求：
1. 基础心理分析（包含性格特征解读、行为模式分析）
2. Big Five人格融合分析（开放性、尽责性、外向性、宜人性、神经质）
3. CBT建议（认知行为疗法建议）
4. 输出结构化JSON格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业心理建议。`
    : `Please generate a psychological analysis report based on the following assessment information:
Assessment type: ${data.type}
Assessment results: ${data.results}
Personality traits: ${data.personality}
Behavioral patterns: ${data.behavior}

Requirements:
1. Basic psychological analysis (including personality trait interpretation, behavioral pattern analysis)
2. Big Five personality integration analysis (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
3. CBT recommendations (Cognitive Behavioral Therapy suggestions)
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional psychological advice.`;

  return basePrompt;
}