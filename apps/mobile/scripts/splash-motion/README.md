# Continuous book-to-fruit-tree scene source

3 November 2026. `scene.py` authors a genuine, continuous 3D scene in Blender:
meshes, a physical cover hinge, flexible page shape keys, curve growth, individual
leaf deformation and attached fruit scaling. It does not sequence photographic
stills, crossfade between growth pictures or use image planes for foliage.

This is an **unrendered source alternative**, not a completed animation or an
approved visual. No Blender installation, scene execution, render, video export,
app integration or runtime checks have been performed. The source targets
Blender 4.5 LTS and uses Cycles on CPU. Later Blender compatibility, material
quality, timing, contacts and the final commercial finish need actual renders.

## One take, eight seconds

The square camera stays fixed. A dark forest cloth book and warm paper sit in a
soft studio environment; roots start at the seed's coordinate in the page crease.
No hands, text, ornaments, confetti, fake lettering or sound are added.

| Frames at 30 fps | Motion |
| --- | --- |
| 1–13 | Closed book grows into view and settles; no photographic transition |
| 15–43 | Front cover swings about the spine to the left |
| 34–74 | Six overlapping, bending paper sheets turn from right to left |
| 70–86 | Seed is revealed in the crease and gently swells |
| 83–108 | Roots extend; seed coat separates into two modeled halves |
| 88–158 | Trunk lengthens along its curve and gradually thickens |
| 112–161 | Nine attached branches extend progressively |
| 137–198 | Seventy-seven individual leaves grow and unfurl from buds |
| 194–208 | Five small fruit stalks extend from branch tips |
| 200–229 | Five golden fruits swell while attached; leaves already open |
| 230–240 | Finished tree remains still for the closing beat |

An eight-second take is an authoring target, not a decision to block every app
launch for eight seconds. Review motion first, then decide startup playback,
reduced-motion presentation and the transition into the existing app. The icon
remains static and is a separate deliverable.

## Reproduce when rendering is authorized

Run in a fresh background Blender process because the script replaces the active
scene. It does not modify application code or install any Python/app packages.
Use an ignored output directory, not the tracked assets directory:

```sh
blender --background --factory-startup \
  --python apps/mobile/scripts/splash-motion/scene.py -- \
  --output .artifacts/sundayseeds-growth
```

With no `--render` argument it **only constructs and saves**
`sundayseeds-growth.blend`; it does not render. All examples below also reconstruct
and save that scene before rendering.

```sh
# One frame for framing/contact/material inspection, then review other key poses.
blender --background --factory-startup \
  --python apps/mobile/scripts/splash-motion/scene.py -- \
  --output .artifacts/sundayseeds-growth --render still --frame 240 --size 900

# Render the full, editable PNG sequence.
blender --background --factory-startup \
  --python apps/mobile/scripts/splash-motion/scene.py -- \
  --output .artifacts/sundayseeds-growth --render frames --size 900 --samples 64

# Optional direct silent H.264 export, if the Blender build includes FFmpeg output.
blender --background --factory-startup \
  --python apps/mobile/scripts/splash-motion/scene.py -- \
  --output .artifacts/sundayseeds-growth --render video --size 900 --samples 64
```

PNG frames are saved under `frames/frame-####.png`; stills use
`frame-####.png` at the output root. Direct video uses
`sundayseeds-growth.mp4`. The script's argument separator `--` is required.
Default resolution is 900 square and default sampling is 64. CPU cost is unknown
until a real render is run; start with selected stills, not the full sequence.

The studio floor uses a pale material close to the app paper color, but lighting
and AgX affect its rendered pixels. Exact `#FCFAFF` edge matching, native-safe
framing, compression, final duration and video-player integration remain separate
acceptance work. The output has an opaque studio background, not transparency.

## Source review and render acceptance

Source was read for page topology, attachment coordinates, phase ordering,
output paths and the opt-in render boundary. Source review corrected the closed
page-block intersection by adjusting the spine hinge/local offsets, and moved
each fruit's growth origin to its stalk endpoint so a small bud stays attached
throughout expansion. Trunk wood, branch roots and crown leaves now share an
explicit sampled centreline rather than estimating an automatic curve's position.
No checks or rendering were executed. The scene has no
cloth simulation; explicitly modeled flexible-sheet poses provide the
page curl. Growth is an art-directed accelerated time lapse, not a botanical
simulation. These choices do not guarantee the scene looks naturalistic before
render review.

Inspect frames 1/13, 28, 43, 55, 74, 86, 102, 130, 161, 198, 215 and 240 for
cover/page collisions, seed visibility, roots meeting paper, branch-to-trunk
contacts, leaf attachment, fruit stalk contact, framing and finished silhouette.
Then play the whole take to review smoothness and rhythm. Fix any faults in the
scene before exporting a mobile asset or claiming the motion is complete.

Relevant Blender references:
[curve growth API](https://docs.blender.org/api/5.0/bpy.types.Curve.html),
[keyframe insertion](https://docs.blender.org/api/master/bpy.types.bpy_struct.html),
[Cycles CPU rendering](https://docs.blender.org/manual/en/5.0/render/cycles/render_settings/index.html).
The available web tool returned official search excerpts for these APIs; direct
versioned API-page fetches were blocked. Blender execution is still needed to
verify actual compatibility.
