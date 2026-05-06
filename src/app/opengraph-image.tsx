import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Resume Master AI — Build Your Perfect Resume with AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '200px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Left content */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '620px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              ✦
            </div>
            <span style={{ fontSize: '22px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Resume Master AI
            </span>
          </div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Build Your Perfect Resume with AI
          </h1>
          <p style={{ fontSize: '24px', color: '#94a3b8', marginTop: '24px', lineHeight: 1.5 }}>
            10 stunning templates · AI suggestions · Cover letter generator
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '36px' }}>
            {['Free to Start', 'ATS-Optimized', 'AI-Powered'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 20px',
                  borderRadius: '999px',
                  border: '1px solid rgba(99,102,241,0.5)',
                  color: '#a5b4fc',
                  fontSize: '16px',
                  background: 'rgba(99,102,241,0.1)',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Right — stylized resume document */}
        <div
          style={{
            width: '300px',
            height: '400px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ width: '120px', height: '14px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '4px' }} />
            <div style={{ width: '80px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          {[0.9, 0.7, 0.85, 0.6].map((w, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ width: `${w * 100}%`, height: '8px', background: 'rgba(255,255,255,0.25)', borderRadius: '4px' }} />
              <div style={{ width: '60%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
            </div>
          ))}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[70, 55, 85].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: '22px', background: 'rgba(99,102,241,0.3)', borderRadius: '999px' }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
