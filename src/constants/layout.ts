/** App chrome heights — keep in sync with Layout / BottomNav */
export const APP_BAR_HEIGHT = 56;
export const BOTTOM_NAV_HEIGHT = 64;

export const SAFE_TOP = "env(safe-area-inset-top, 0px)";
export const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";
export const SAFE_LEFT = "env(safe-area-inset-left, 0px)";
export const SAFE_RIGHT = "env(safe-area-inset-right, 0px)";

export const APP_BAR_TOTAL = `calc(${APP_BAR_HEIGHT}px + ${SAFE_TOP})`;
export const BOTTOM_NAV_TOTAL = `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`;
