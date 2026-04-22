export function getBaziReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下八字信息生成命理分析报告：
八字信息：${data.bazi}
五行分析：${data.wuxing}
十神分析：${data.shishen}
请结合传统命理学、Big Five人格理论和认知行为疗法(CBT)给出专业建议。
输出格式为JSON，包含以下字段：
- 命理分析：传统命理学解释
- 人格特征：Big Five人格理论分析
- 心理建议：CBT建议
- 免责声明：本报告仅供参考，不构成专业医疗建议`
    : `Please generate a fortune-telling report based on the following BaZi information:
BaZi data: ${data.bazi}
Five Elements analysis: ${data.wuxing}
Ten Gods analysis: ${data.shishen}
Please integrate traditional Chinese fortune-telling, Big Five personality theory, and Cognitive Behavioral Therapy (CBT) to provide professional recommendations.
Output format should be JSON with the following fields:
- Fortune Analysis: Traditional Chinese fortune-telling interpretation
- Personality Traits: Big Five personality theory analysis
- Psychological Recommendations: CBT suggestions
- Disclaimer: This report is for reference only and does not constitute professional medical advice`;

  return basePrompt;
}

export function getZiweiReportPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下紫微斗数信息生成命理分析报告：
紫微斗数信息：${data.ziwei}
命宫：${data.minggong}
财帛宫：${data.caibogong}
官禄宫：${data.guanlugong}
请结合传统命理学、Big Five人格理论和认知行为疗法(CBT)给出专业建议。
输出格式为JSON，包含以下字段：
- 命理分析：传统命理学解释
- 人格特征：Big Five人格理论分析
- 心理建议：CBT建议
- 免责声明：本报告仅供参考，不构成专业医疗建议`
    : `Please generate a fortune-telling report based on the following ZiWei Dou Shu information:
ZiWei Dou Shu data: ${data.ziwei}
Ming Gong: ${data.minggong}
Cai Bo Gong: ${data.caibogong}
Guan Lu Gong: ${data.guanlugong}
Please integrate traditional Chinese fortune-telling, Big Five personality theory, and Cognitive Behavioral Therapy (CBT) to provide professional recommendations.
Output format should be JSON with the following fields:
- Fortune Analysis: Traditional Chinese fortune-telling interpretation
- Personality Traits: Big Five personality theory analysis
- Psychological Recommendations: CBT suggestions
- Disclaimer: This report is for reference only and does not constitute professional medical advice`;

  return basePrompt;
}

export function getPsychologyPrompt(data, language): string {
  const isChinese = language === 'zh';
  
  const basePrompt = isChinese 
    ? `请基于以下心理测评数据生成心理分析报告：
测评数据：${data.psychology}
Big Five人格维度：${data.bigfive}
认知行为疗法(CBT)建议：${data.cbt}
请结合专业心理学理论和CBT方法给出个性化建议。
输出格式为JSON，包含以下字段：
- 心理分析：专业心理学解释
- 人格特征：Big Five人格理论分析
- 心理建议：CBT建议
- 免责声明：本报告仅供参考，不构成专业医疗建议`
    : `Please generate a psychological analysis report based on the following psychological assessment data:
Assessment data: ${data.psychology}
Big Five personality dimensions: ${data.bigfive}
Cognitive Behavioral Therapy (CBT) recommendations: ${data.cbt}
Please integrate professional psychology theory and CBT methods to provide personalized recommendations.
Output format should be JSON with the following fields:
- Psychological Analysis: Professional psychology interpretation
- Personality Traits: Big Five personality theory analysis
- Psychological Recommendations: CBT suggestions
- Disclaimer: This report is for reference only and does not constitute professional medical advice`;

  return basePrompt;
}