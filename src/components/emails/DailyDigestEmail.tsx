/**
 * Daily Digest Email Template — TianJi Global
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
  Row,
  Column,
} from '@react-email/components';

interface DigestSection {
  serviceType: string;
  serviceLabel: string;
  summary: string;
  luckyElement?: string;
  luckyNumber?: string;
  luckyColor?: string;
  overallScore?: number;
}

interface DailyDigestEmailProps {
  userName: string;
  digestUrl: string;
  unsubscribeUrl: string;
  sections: DigestSection[];
  language?: 'zh' | 'en';
}

const PLATFORM_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.global';
const LOGO_URL = `${PLATFORM_URL}/logo.png`;

function ServiceIcon({ service }: { service: string }) {
  const icons: Record<string, string> = {
    bazi: '📊',
    yijing: '☰',
    tarot: '🃏',
    ziwei: '⭐',
    fortune: '🔮',
  };
  return <span style={{ fontSize: 24 }}>{icons[service] || '🔮'}</span>;
}

function ScoreBar({ score }: { score: number }) {
  const filled = Math.round(score / 20); // 1-5 scale
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 20,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= filled ? '#f59e0b' : '#e5e7eb',
          }}
        />
      ))}
    </div>
  );
}

export function DailyDigestEmail({
  userName,
  digestUrl,
  unsubscribeUrl,
  sections,
  language = 'zh',
}: DailyDigestEmailProps) {
  const isZh = language === 'zh';
  const greeting = isZh
    ? `${userName}，今日运势已更新 ✨`
    : `${userName}, your daily fortune is ready ✨`;
  const ctaLabel = isZh ? '查看完整报告' : 'View Full Report';
  const unsubscribeLabel = isZh ? '退订推送' : 'Unsubscribe';
  const disclaimerLabel = isZh ? '免责声明' : 'Disclaimer';
  const disclaimer = isZh
    ? '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。重要人生决策请咨询具备资质的专业人士。This reading is for entertainment reference only and does not constitute professional advice.'
    : 'This reading is for entertainment and self-reflection purposes only. It does not constitute medical, legal, or financial advice. Always consult a qualified professional for important life decisions.';
  const footerText = isZh
    ? '您收到此邮件是因为已订阅天机全球每日运势推送'
    : 'You received this email because you subscribed to TianJi Global daily fortune updates.';

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0f172a', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: 32 }}>
            <Img
              src={LOGO_URL}
              width={48}
              height={48}
              alt="TianJi Global"
              style={{ margin: '0 auto', display: 'block' }}
            />
            <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>
              天机全球 TianJi Global
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              {isZh ? '每日运势 ·' : 'Daily Fortune ·'} {new Date().toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 600, margin: 0 }}>
              {greeting}
            </Text>
          </Section>

          {/* Digest Sections */}
          {sections.map((section) => (
            <Section
              key={section.serviceType}
              style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}
            >
              <Row>
                <Column style={{ verticalAlign: 'middle', width: 44 }}>
                  <ServiceIcon service={section.serviceType} />
                </Column>
                <Column>
                  <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>
                    {section.serviceLabel}
                  </Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    {section.summary}
                  </Text>
                </Column>
              </Row>

              {(section.luckyElement || section.luckyNumber || section.luckyColor) && (
                <Section style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #334155' }}>
                  <Row>
                    {section.luckyElement && (
                      <Column style={{ paddingRight: 12 }}>
                        <Text style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {isZh ? '幸运元素' : 'Lucky Element'}
                        </Text>
                        <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, margin: '2px 0 0 0' }}>
                          {section.luckyElement}
                        </Text>
                      </Column>
                    )}
                    {section.luckyNumber && (
                      <Column style={{ paddingRight: 12 }}>
                        <Text style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {isZh ? '幸运数字' : 'Lucky Number'}
                        </Text>
                        <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, margin: '2px 0 0 0' }}>
                          {section.luckyNumber}
                        </Text>
                      </Column>
                    )}
                    {section.luckyColor && (
                      <Column>
                        <Text style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {isZh ? '幸运色彩' : 'Lucky Color'}
                        </Text>
                        <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, margin: '2px 0 0 0' }}>
                          {section.luckyColor}
                        </Text>
                      </Column>
                    )}
                  </Row>
                </Section>
              )}

              {section.overallScore !== undefined && (
                <Section style={{ marginTop: 12 }}>
                  <Text style={{ color: '#64748b', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {isZh ? '综合指数' : 'Overall Score'}
                  </Text>
                  <ScoreBar score={section.overallScore} />
                </Section>
              )}
            </Section>
          ))}

          {/* CTA Button */}
          <Section style={{ textAlign: 'center', marginTop: 28, marginBottom: 32 }}>
            <Button
              href={digestUrl}
              style={{
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                fontSize: 16,
                fontWeight: 700,
                padding: '14px 36px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {ctaLabel}
            </Button>
          </Section>

          {/* Disclaimer */}
          <Section style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
            <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚠️ {disclaimerLabel}: ENTERTAINMENT REFERENCE ONLY
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              {disclaimer}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 12, margin: '0 0 8px 0' }}>
              {footerText}
            </Text>
            <Button
              href={unsubscribeUrl}
              style={{
                color: '#64748b',
                fontSize: 12,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              {unsubscribeLabel}
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DailyDigestEmail;
