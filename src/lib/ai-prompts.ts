export function getBaziReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下八字信息生成命理分析报告：
八字信息：${data.bazi}
五行分析：${data.wuxing}
十神分析：${data.shishen}

要求：
1. 基础命理解释
2. Big Five人格融合分析
3. CBT建议
4. 专业术语准确
5. 输出结构化JSON
6. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业命理建议。`
    : `Please generate a BaZi analysis report based on the following information:
BaZi data: ${data.bazi}
Five Elements analysis: ${data.wuxing}
Ten Gods analysis: ${data.shishen}

Requirements:
1. Basic BaZi interpretation
2. Big Five personality integration
3. CBT recommendations
4. Accurate professional terminology
5. Structured JSON output
6. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional BaZi advice.`;

  return basePrompt;
}

export function getZiweiReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下紫微斗数信息生成命理分析报告：
紫微斗数信息：${data.ziwei}
十二宫位：${data.shiergong}
星曜分布：${data.xingyao}

要求：
1. 基础命理解释
2. Big Five人格融合分析
3. CBT建议
4. 专业术语准确
5. 输出结构化JSON
6. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业命理建议。`
    : `Please generate a ZiWei analysis report based on the following information:
ZiWei data: ${data.ziwei}
Twelve Palaces: ${data.shiergong}
Stars distribution: ${data.xingyao}

Requirements:
1. Basic ZiWei interpretation
2. Big Five personality integration
3. CBT recommendations
4. Accurate professional terminology
5. Structured JSON output
6. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional ZiWei advice.`;

  return basePrompt;
}

export function getPsychologyPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下心理分析信息生成心理报告：
心理测试结果：${data.psychology}
Big Five人格：${data.bigfive}
CBT建议：${data.cbt}

要求：
1. 基础心理分析
2. Big Five人格融合分析
3. CBT建议
4. 专业术语准确
5. 输出结构化JSON
6. 包含免责声明

免责声明：本报告仅供参考，不构成任何专业心理建议。`
    : `Please generate a psychological analysis report based on the following information:
Psychology test results: ${data.psychology}
Big Five personality: ${data.bigfive}
CBT recommendations: ${data.cbt}

Requirements:
1. Basic psychological analysis
2. Big Five personality integration
3. CBT recommendations
4. Accurate professional terminology
5. Structured JSON output
6. Include disclaimer

Disclaimer: This report is for reference only and does not constitute professional psychological advice.`;

  return basePrompt;
}