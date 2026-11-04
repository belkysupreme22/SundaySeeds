"""Author the SundaySeeds continuous 3D growth scene; rendering is opt-in.

Run only inside Blender. See README.md. No downloaded models, images or add-ons.
"""

import argparse
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector


FPS, END = 30, 240
ROOT = Vector((0.12, -0.18, 0.435))


def arguments():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--render", choices=("frames", "still", "video"))
    parser.add_argument("--frame", type=int, default=END)
    parser.add_argument("--size", type=int, default=900)
    parser.add_argument("--samples", type=int, default=64)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    if not 1 <= args.frame <= END or args.size < 128 or args.samples < 1:
        parser.error("Frame must be 1–240; size >=128; samples >=1.")
    return args


def key(owner, path, frame, value):
    setattr(owner, path, value)
    owner.keyframe_insert(data_path=path, frame=frame)


def grow(obj, start, end, scale=(1, 1, 1)):
    key(obj, "scale", 1, (0.0001, 0.0001, 0.0001))
    key(obj, "scale", start, (0.0001, 0.0001, 0.0001))
    key(obj, "scale", end, scale)


def material(name, color, roughness=0.6, grain=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = roughness
    if grain:
        noise = mat.node_tree.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = grain
        bump = mat.node_tree.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.12
        bump.inputs["Distance"].default_value = 0.018
        mat.node_tree.links.new(noise.outputs["Fac"], bump.inputs["Height"])
        mat.node_tree.links.new(bump.outputs["Normal"], shader.inputs["Normal"])
    return mat


def mesh(name, vertices, faces, mat, parent):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.data.materials.append(mat)
    for polygon in data.polygons:
        polygon.use_smooth = True
    return obj


def box(name, center, dimensions, mat, parent, bevel=0.025):
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = name
    obj.parent = parent
    obj.location = center
    # Bake dimensions into vertices: later animation scales are independent.
    for vertex in obj.data.vertices:
        vertex.co = Vector(tuple(vertex.co[i] * dimensions[i] for i in range(3)))
    obj.data.materials.append(mat)
    modifier = obj.modifiers.new("Soft manufactured edges", "BEVEL")
    modifier.width, modifier.segments = bevel, 3
    obj.modifiers.new("Weighted cover normals", "WEIGHTED_NORMAL")
    return obj


def empty(name, parent=None, position=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.parent, obj.location = parent, position
    return obj


def curve(name, points, radius, mat, parent, start, end, polyline=False):
    data = bpy.data.curves.new(name, "CURVE")
    data.dimensions, data.resolution_u = "3D", 20
    data.bevel_depth, data.bevel_resolution, data.use_fill_caps = radius, 4, True
    data.bevel_factor_mapping_end = "SPLINE"
    spline = data.splines.new("POLY" if polyline else "BEZIER")
    controls = spline.points if polyline else spline.bezier_points
    controls.add(len(points) - 1)
    for index, (point, co) in enumerate(zip(controls, points)):
        point.co = (*co, 1) if polyline else co
        if not polyline:
            point.handle_left_type = point.handle_right_type = "AUTO"
        point.radius = max(0.13, 1 - index / len(points))
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    data.materials.append(mat)
    key(data, "bevel_factor_end", 1, 0)
    key(data, "bevel_factor_end", start, 0)
    key(data, "bevel_factor_end", end, 1)
    return obj


def sphere(name, position, mat, parent, scale, mesh_offset=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16)
    obj = bpy.context.object
    obj.name, obj.parent, obj.location = name, parent, position
    for vertex in obj.data.vertices:
        vertex.co = Vector(tuple(vertex.co[i] * scale[i] + mesh_offset[i] for i in range(3)))
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    obj.data.materials.append(mat)
    return obj


def seed_half(side, mat, parent):
    vertices = []
    for row in range(9):
        theta = max(0.0001, row * math.pi / 16)
        for column in range(24):
            phi = column * math.tau / 24
            vertices.append((side * 0.105 * math.cos(theta),
                             0.075 * math.sin(theta) * math.cos(phi),
                             0.055 * math.sin(theta) * math.sin(phi)))
    faces = [(r * 24 + c, r * 24 + (c + 1) % 24,
              (r + 1) * 24 + (c + 1) % 24, (r + 1) * 24 + c)
             for r in range(8) for c in range(24)]
    faces.append(tuple(range(8 * 24, 9 * 24)))
    return mesh(f"Opening seed half {side}", vertices, faces, mat, parent)


def page_points(angle, height):
    """A flexible sheet, pinned to the spine, with a rolling free edge."""
    points = []
    for i in range(25):
        u = i / 24
        for j in range(5):
            v = j / 4
            # A curl wave travels from spine to edge during the turn.
            bend = 0.28 * math.sin(math.pi * u) * math.sin(angle)
            lag = 0.15 * math.sin(angle) * math.sin(math.pi * u)
            theta = angle - lag
            x = 2.1 * u * math.cos(theta)
            y = (v - 0.5) * 2.72 + 0.055 * math.sin(angle) * u * (2 * v - 1)
            z = height + 2.1 * u * math.sin(theta) + bend
            points.append((x, y, z))
    return points


def turning_page(index, paper, root):
    height = 0.445 + index * 0.003
    faces = [(i * 5 + j, (i + 1) * 5 + j, (i + 1) * 5 + j + 1, i * 5 + j + 1)
             for i in range(24) for j in range(4)]
    obj = mesh(f"Turning sheet {index + 1:02}", page_points(0, height), faces, paper, root)
    obj.shape_key_add(name="Resting on right")
    # Each adjacent pose has identical topology; geometry interpolates, not images.
    poses = []
    for step in range(1, 9):
        pose = obj.shape_key_add(name=f"Flexible turn {step}/8")
        for point, co in zip(pose.data, page_points(math.pi * step / 8, height)):
            point.co = co
        poses.append(pose)
    start = 34 + index * 4
    for step, pose in enumerate(poses, start=1):
        key(pose, "value", start + (step - 1) * 2.5, 0)
        key(pose, "value", start + step * 2.5, 1)
        if step < 8:
            key(pose, "value", start + (step + 1) * 2.5, 0)
    solid = obj.modifiers.new("Paper thickness", "SOLIDIFY")
    solid.thickness = 0.002
    return obj


def leaf(name, base, direction, length, mat, parent, start):
    """A curved blade unrolls from its petiole; no foliage card textures."""
    vertices, curled, faces = [], [], []
    rows, columns = 12, 4
    for i in range(rows + 1):
        u = i / rows
        half_width = 0.32 * length * math.sin(math.pi * u)
        for j in range(columns + 1):
            side = 2 * j / columns - 1
            vertices.append((side * half_width, length * u,
                             0.11 * length * math.sin(math.pi * u) - side * side * 0.06 * length))
            curled.append((side * half_width * 0.25, length * u * 0.3,
                           length * 0.42 * math.sin(u * math.pi)))
    for i in range(rows):
        for j in range(columns):
            a = i * (columns + 1) + j
            faces.append((a, a + 1, a + columns + 2, a + columns + 1))
    obj = mesh(name, vertices, faces, mat, parent)
    obj.location = base
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector(direction).to_track_quat("Y", "Z")
    obj.shape_key_add(name="Unfurled blade")
    curl = obj.shape_key_add(name="Folded bud")
    for point, co in zip(curl.data, curled):
        point.co = co
    key(curl, "value", 1, 1)
    key(curl, "value", start, 1)
    key(curl, "value", start + 20, 0)
    grow(obj, start, start + 22)
    solid = obj.modifiers.new("Leaf body", "SOLIDIFY")
    solid.thickness = 0.003
    return obj


def book(root, cover, paper, page_edge):
    box("Back cover", (1.12, 0, 0.075), (2.3, 2.98, 0.09), cover, root)
    box("Right page block", (1.08, 0, 0.262), (2.15, 2.79, 0.29), page_edge, root)
    # Closed: left block bottom = .410 + .132 - .135 = right block top .407.
    # Open: its top = .410 - .132 + .135 = .413; cover centre = .075.
    hinge = empty("Cover hinge — fixed to spine", root, (0, 0, 0.410))
    box("Front cover", (1.12, 0, 0.335), (2.3, 2.98, 0.09), cover, hinge)
    box("Left page block", (1.08, 0, 0.132), (2.15, 2.79, 0.27), page_edge, hinge)
    # Opening swings about the physical spine; no position jump or crossfade.
    key(hinge, "rotation_euler", 1, (0, 0, 0))
    key(hinge, "rotation_euler", 15, (0, 0, 0))
    key(hinge, "rotation_euler", 43, (0, -math.pi, 0))
    box("Right resting page", (1.07, 0, 0.417), (2.12, 2.77, 0.012), paper, root, 0.008)
    for index in range(6):
        turning_page(index, paper, root)
    # Subtle horizontal edge lines articulate the closed book without pseudo-text.
    for z in (0.15, 0.2, 0.25, 0.3, 0.35):
        box(f"Page edge at {z}", (2.157, 0, z), (0.006, 2.74, 0.003), paper, root, 0.001)


def tree(root, bark, greens, fruit_mat, seed_mat):
    seed_parent = empty("Seed rooted in page crease", root, ROOT)
    seed = sphere("Seed coat", (0, 0, 0.035), seed_mat, seed_parent, (0.105, 0.075, 0.055))
    # Hidden under the last sheet until the page-turn sequence reveals the seed.
    grow(seed, 70, 77)
    key(seed, "scale", 86, (1.18, 1.18, 1.18))
    key(seed, "scale", 96, (0.0001, 0.0001, 0.0001))
    for side in (-1, 1):
        shell = seed_half(side, seed_mat, seed_parent)
        grow(shell, 87, 93)
        key(shell, "location", 87, (0, 0, 0.035))
        key(shell, "location", 102, (side * 0.095, 0, 0.015))
        key(shell, "rotation_euler", 102, (0, side * 0.5, 0))
    for i, direction in enumerate(((-0.3, -0.28, -0.015), (0.28, 0.24, -0.02), (-0.15, 0.4, -0.02))):
        end = ROOT + Vector(direction)
        curve(f"Root {i + 1}", (ROOT, ROOT.lerp(end, 0.5), end), 0.018, bark, root, 83 + i * 3, 108)
    def trunk_point(height):
        if height < 1.15:
            t = (height - ROOT.z) / (1.15 - ROOT.z)
            center = ROOT.lerp(Vector((0.06, -0.08, 1.15)), t * t * (3 - 2 * t))
        elif height <= 2.87:
            center = Vector((0.06, -0.08, height))
        else:
            t = (height - 2.87) / (3.52 - 2.87)
            center = Vector((0.06, -0.08, 2.87)).lerp(Vector((0.02, 0.05, 3.52)), t * t * (3 - 2 * t))
        return Vector((center.x, center.y, height))
    # Use the same centreline for wood and attachment coordinates; no guessing
    # where an automatic Bezier handle happens to put the trunk at a given z.
    trunk_points = [trunk_point(ROOT.z + (3.52 - ROOT.z) * i / 128) for i in range(129)]
    trunk = curve("Growing trunk", trunk_points, 0.085, bark, root, 88, 144, polyline=True)
    key(trunk.data, "bevel_depth", 88, 0.018)
    key(trunk.data, "bevel_depth", 158, 0.085)
    for index in range(9):
        angle = index * 2.4
        height = 1.5 + index * 0.17
        origin = trunk_point(height)
        spread = 1.03 - index * 0.033
        end = Vector((math.cos(angle) * spread, math.sin(angle) * spread * 0.7, height + 0.7))
        middle = origin.lerp(end, 0.55) + Vector((0, 0, -0.12))
        start = 112 + index * 3
        def branch_point(t):
            return (1 - t) ** 2 * origin + 2 * (1 - t) * t * middle + t * t * end
        # Dense quadratic samples give every leaf an exact attachment coordinate.
        curve(f"Branch {index + 1}", [branch_point(i / 32) for i in range(33)],
              0.04 - index * 0.0018, bark, root, start, start + 25, polyline=True)
        for pair, amount in enumerate((0.48, 0.66, 0.83, 1.0)):
            base = branch_point(amount)
            for side in (-1, 1):
                tangent = end - origin
                outward = Vector((-tangent.y * side, tangent.x * side, 0.2))
                leaf(f"Leaf {index + 1}.{pair + 1}.{side}", base, outward,
                     0.34 + 0.08 * math.sin(index + pair), greens[(index + pair) % len(greens)],
                     root, 137 + index * 3 + pair * 2)
        if index in (0, 2, 4, 6, 8):
            # Stalk and fruit share one parent: fruit stays attached while swelling.
            cluster = empty(f"Fruit cluster {index + 1}", root, end)
            curve("Fruit stalk", ((0, 0, 0), (0.02, 0, -0.06), (0.025, 0, -0.11)),
                  0.009, bark, cluster, 194 + index, 200 + index)
            # Origin at the pedicel, with the mesh hanging below it: even the
            # tiniest bud touches the stalk throughout scale-based growth.
            fruit = sphere(f"Growing fruit {index + 1}", (0.025, 0, -0.11), fruit_mat,
                           cluster, (0.125, 0.125, 0.14), mesh_offset=(0, 0, -0.14))
            grow(fruit, 200 + index, 221 + index)
    for index in range(5):
        angle = index * 2.4
        leaf(f"Crown leaf {index + 1}", trunk_point(3.35 + index * 0.025),
             (math.cos(angle), math.sin(angle), 0.6), 0.34, greens[index % 3], root, 168 + index * 2)


def light(name, position, power, size):
    data = bpy.data.lights.new(name, "AREA")
    data.energy, data.shape, data.size = power, "DISK", size
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = position
    obj.rotation_euler = (Vector((0, 0, 1.4)) - obj.location).to_track_quat("-Z", "Y").to_euler()


def main():
    args = arguments()
    if bpy.app.version < (4, 5, 0):
        raise RuntimeError("This source targets Blender 4.5 LTS or newer.")
    output = args.output.expanduser().resolve()
    output.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end, scene.render.fps = 1, END, FPS
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples, scene.cycles.use_denoising = args.samples, True
    scene.render.resolution_x = scene.render.resolution_y = args.size
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "AgX"
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.8, 0.83, 0.9, 1)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35
    cover = material("Forest cloth cover", (0.015, 0.061, 0.038), 0.76, 65)
    paper = material("Warm paper", (0.88, 0.84, 0.72), 0.85, 180)
    edge = material("Page edges", (0.71, 0.67, 0.57), 0.9)
    bark = material("Young warm wood", (0.18, 0.095, 0.038), 0.82, 22)
    greens = [material(f"Leaf green {i}", c, 0.48) for i, c in enumerate(
        ((0.045, 0.19, 0.053), (0.08, 0.25, 0.07), (0.12, 0.31, 0.075)))]
    fruit_mat = material("Golden fruit", (0.93, 0.39, 0.035), 0.36, 95)
    seed_mat = material("Seed coat", (0.2, 0.105, 0.038), 0.62, 35)
    root = empty("Book and living tree")
    key(root, "location", 1, (-0.65, 0, -0.08))
    key(root, "location", 16, (-0.65, 0, 0))
    key(root, "location", 44, (0, 0, 0))
    grow(root, 1, 13)
    book(root, cover, paper, edge)
    tree(root, bark, greens, fruit_mat, seed_mat)
    ground = material("Paper studio", (0.973, 0.956, 1.0), 0.9)
    box("Studio floor", (0, 0, -0.03), (200, 200, 0.04), ground, None, 0.001)
    light("Large window key", (-3, -4, 7), 650, 5)
    light("Soft fill", (4, -1, 4), 220, 4)
    light("Leaf edge light", (1, 4, 6), 420, 3.5)
    camera_data = bpy.data.cameras.new("Continuous-take camera")
    camera = bpy.data.objects.new("Continuous-take camera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (5.7, -9.0, 6.8)
    camera.rotation_euler = (Vector((0, 0, 1.55)) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera_data.type, camera_data.ortho_scale = "ORTHO", 6.6
    scene.camera = camera
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    frames = output / "frames"
    frames.mkdir(exist_ok=True)
    scene.render.filepath = str(frames / "frame-")
    if args.render == "video":
        # Requires a Blender distribution with FFmpeg output support.
        scene.render.image_settings.file_format = "FFMPEG"
        scene.render.ffmpeg.format, scene.render.ffmpeg.codec = "MPEG4", "H264"
        scene.render.ffmpeg.constant_rate_factor = "HIGH"
        scene.render.filepath = str(output / "sundayseeds-growth.mp4")
    scene.frame_set(args.frame if args.render == "still" else 1)
    bpy.ops.wm.save_as_mainfile(filepath=str(output / "sundayseeds-growth.blend"))
    if args.render == "still":
        scene.render.filepath = str(output / f"frame-{args.frame:04}.png")
        bpy.ops.render.render(write_still=True)
    elif args.render in ("frames", "video"):
        bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    main()
