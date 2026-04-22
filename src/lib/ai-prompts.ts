export function getBaziReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请根据以下八字信息生成命理分析报告：
八字信息：${data.bazi}
五行分析：${data.wuxing}
日主强弱：${data.rizhu}
用神分析：${data.yongshen}

要求：
1. 基础命理解释（包含五行喜忌、日主强弱分析）
2. Big Five 人格融合（结合性格特质与命理分析）
3. CBT 建议（基于命理和心理学的实用建议）
4. 输出结构化 JSON 格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a fortune-telling report based on the following BaZi information:
BaZi data: ${data.bazi}
Five Elements analysis: ${data.wuxing}
Day Master strength: ${data.rizhu}
Use Element analysis: ${data.yongshen}

Requirements:
1. Basic BaZi interpretation (including Five Elements preferences, Day Master strength analysis)
2. Big Five personality integration (combining personality traits with BaZi analysis)
3. CBT recommendations (practical advice based on BaZi and psychology)
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

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

要求：
1. 基础紫微斗数解释（包含命宫、身宫、十二宫位分析）
2. Big Five 人格融合（结合性格特质与紫微斗数分析）
3. CBT 建议（基于紫微斗数和心理学的实用建议）
4. 输出结构化 JSON 格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate a fortune-telling report based on the following ZiWei Dou Shu information:
ZiWei Dou Shu data: ${data.ziwei}
Ming Gong: ${data.minggong}
Sheng Gong: ${data.shenggong}
Twelve Palace analysis: ${data.shiergong}

Requirements:
1. Basic ZiWei Dou Shu interpretation (including Ming Gong, Sheng Gong, Twelve Palace analysis)
2. Big Five personality integration (combining personality traits with ZiWei Dou Shu analysis)
3. CBT recommendations (practical advice based on ZiWei Dou Shu and psychology)
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}

export function getPsychologyPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请根据以下心理测评信息生成分析报告：
测评信息：${data.psychology}
性格特征：${data.personality}
心理状态：${data.mood}

要求：
1. 基础心理分析（包含性格特征、心理状态分析）
2. Big Five 人格融合（结合性格特质与心理测评结果）
3. CBT 建议（基于心理学和认知行为疗法的实用建议）
4. 输出结构化 JSON 格式
5. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业建议。`
    : `Please generate an analysis report based on the following psychological assessment information:
Assessment data: ${data.psychology}
Personality traits: ${data.personality}
Mental state: ${data.mood}

Requirements:
1. Basic psychological analysis (including personality traits, mental state analysis)
2. Big Five personality integration (combining personality traits with psychological assessment results)
3. CBT recommendations (practical advice based on psychology and cognitive behavioral therapy)
4. Output in structured JSON format
5. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional advice.`;

  return basePrompt;
}