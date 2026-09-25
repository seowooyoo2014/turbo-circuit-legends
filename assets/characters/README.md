# Character GLB Contract

Place production character assets in this folder using the filenames referenced by `characterAssets` in `red-desert-gambler-3d.html`.

## Required files for the first pass

- `player_gambler.glb`
- `rival_fur_warrior.glb`
- `rival_bald_brute.glb`
- `rival_hood_assassin.glb`
- `rival_red_warrior.glb`
- `rival_noble_blonde.glb`
- `rival_elder_gambler.glb`
- `rival_dwarf_brute.glb`

## Optional environment, fish, and audio assets

The game now also looks for production assets in these folders before falling back to procedural browser-generated models:

- `assets/environment/gamble_den.glb`
- `assets/fish/<fish name>.glb`
- `assets/audio/desert.ogg`
- `assets/audio/oasis.ogg`
- `assets/audio/boss.ogg`
- `assets/audio/sky.ogg`
- `assets/audio/fish.ogg`
- `assets/audio/game_over.ogg`

Fish filenames are generated from Korean fish names with spaces replaced by `_`, for example `작은_모래붕어.glb`.

## Animation clip names

Each GLB should use these clip names when available:

- `idle`
- `dice_lift`
- `dice_throw`
- `dice_drop`
- `win`
- `lose`
- `cheat`
- `hit`

## Authoring rules

- Format: GLB or glTF 2.0.
- Unit scale: 1 Three.js unit = 1 meter.
- Origin: chair center at floor level.
- Forward direction: `-Z`.
- Texture set: PBR base color, normal, roughness, metallic.
- Runtime fallback remains active when a GLB is missing or a clip is absent.
- Fishing character clips can reuse existing clips, but dedicated clips should use `fish_idle`, `fish_cast`, `fish_wait`, `fish_hook`, `fish_catch`, and `fish_miss`.
