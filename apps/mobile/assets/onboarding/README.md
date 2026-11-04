# Onboarding photography-style artwork

3 November 2026. Original generated images with a photographic feel, created with
the built-in image-generation tool. They depict fictional people/scenes, not real
members, testimonials or documentary photography. The owner asked to replace the
static Orthodox introduction artwork and add motion.

| Asset | Scene | Introduction |
| --- | --- | --- |
| `learn.jpg` | Quiet Bible reading by a window | Grow in faith |
| `live.jpg` | Friends sharing a Bible discussion | Carry Sunday into your week |
| `grow.jpg` | A seedling held over an open book | See your little seeds grow |

The images retain natural colors. They are not recolored to the interface palette.
JPEG derivatives use quality88 at original dimensions to reduce bundled size;
faces, composition and scene content are unchanged. The initial reading sample
and the later B/C photographic concepts supply these assets. B/C prompts and the
concepts are recorded in [artwork directions](../../../../docs/artwork-options/2026-11-03/README.md).

The feature-owned `WelcomeArtwork` handles a soft entrance, slow image drift and
sticker movement. Motion starts only with a loaded image, a focused screen,
foreground app and an explicit non-reduced-motion preference. Blur, background,
unmount and live preference changes stop/reset the loops. A failed image uses the
existing slide icon; navigation never waits for imagery.

Actual checks: asset/source inspection and integration source review. No tests,
typecheck, builds, runtime or native checks ran. Review all three pages at320/390,
large text, Next/Back/Skip, save/recovery, reduced motion and app background/return.
Other learner-screen artwork remains unchanged by this onboarding increment.
