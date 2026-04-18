export interface TimeRule {
  name: string;
  description: string;
  check: (content: string) => boolean;
  message: string;
}

export const TIME_RULES: TimeRule[] = [
  {
    name: 'bazi_new_year',
    description: '八字新年=立春，不是农历正月初一',
    check: (content) => {
      return /新年/i.test(content) && 
             !/立春|春季开始/i.test(content) && 
             /八字|四柱/.test(content);
    },
    message: '八字新年的定义是立春，而非农历正月初一'
  },
  {
    name: 'lunar_vs_gregorian',
    description: '农历vs公历必须明确',
    check: (content) => {
      const hasLunar = /农历|阴历/.test(content);
      const hasGregorian = /公历|阳历/.test(content);
      return hasLunar && hasGregorian && !/(?:农历|阴历).*(?:公历|阳历)|(?:公历|阳历).*(?:农历|阴历)/.test(content);
    },
    message: '报告中同时出现农历和公历概念，需要明确区分'
  }
];
