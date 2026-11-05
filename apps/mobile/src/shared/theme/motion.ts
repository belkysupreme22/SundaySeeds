// Named interaction standards. Do not use timing to manufacture loading progress.
export const motion = {
  duration: {
    instant: 0,
    press: 100,
    feedback: 160,
    enter: 180,
    exit: 140,
    page: 240,
    sheet: 260,
    splash: 2300,
  },
  easing: { standard: [0.2, 0, 0, 1], enter: [0.16, 1, 0.3, 1], exit: [0.4, 0, 1, 1] },
  distance: { press: 1, reveal: 4, sheet: 16 },
  pressedOpacity: 0.88,
  disabledOpacity: 0.45,
} as const;

export const shape = {
  radius: { chip: 6, field: 8, button: 9, card: 12, round: 999 },
  stroke: { subtle: 1, soft: 1, strong: 1.2, focus: 2 },
  shadow: { crisp: '2px 3px 0px #26212E', selected: '1px 2px 0px #26212E' },
} as const;

export const targets = { minimum: 44, preferred: 48, primaryHeight: 52 } as const;
