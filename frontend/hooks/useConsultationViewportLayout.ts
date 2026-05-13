import { useEffect, useState } from 'react';

const SHELL_MAX_CAP_PX = 52 * 16; // 52rem at 16px root
const OUTER_CHROME_RESERVE_PX = 28; // outer shell padding + breathing room
const MIN_SHELL_PX = 260;

export type ConsultationViewportLayout = {
  /** Extra padding-bottom on the scroll column so content can scroll past the keyboard */
  scrollPadBottomPx: number;
  /** Pixel height for the bordered “phone” frame — tracks visualViewport when the keyboard opens */
  shellHeightPx: number;
};

const defaultLayout = (): ConsultationViewportLayout => {
  if (typeof window === 'undefined') {
    return { scrollPadBottomPx: 0, shellHeightPx: SHELL_MAX_CAP_PX };
  }
  const h = window.visualViewport?.height ?? window.innerHeight;
  return {
    scrollPadBottomPx: 0,
    shellHeightPx: Math.min(SHELL_MAX_CAP_PX, Math.max(MIN_SHELL_PX, Math.floor(h - OUTER_CHROME_RESERVE_PX))),
  };
};

/**
 * Tracks window.visualViewport so the patient shell height shrinks when the on-screen
 * keyboard appears (iOS Safari / Chrome). dvh alone often stays “full screen” behind the keyboard.
 */
export function useConsultationViewportLayout(): ConsultationViewportLayout {
  const [layout, setLayout] = useState<ConsultationViewportLayout>(defaultLayout);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const innerH = window.innerHeight;
      const docH = document.documentElement?.clientHeight ?? innerH;
      const visibleBottom = vv.offsetTop + vv.height;
      const fromInner = Math.max(0, innerH - visibleBottom);
      const fromDoc = Math.max(0, docH - visibleBottom);
      const scrollPadBottomPx = Math.max(fromInner, fromDoc);

      const shellHeightPx = Math.min(
        SHELL_MAX_CAP_PX,
        Math.max(MIN_SHELL_PX, Math.floor(vv.height - OUTER_CHROME_RESERVE_PX)),
      );

      setLayout({ scrollPadBottomPx, shellHeightPx });
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return layout;
}
