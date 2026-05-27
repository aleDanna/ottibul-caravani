# Image Alt-Text Audit

**Status:** Draft awaiting owner action via admin panel.

## Style guide

A good `alt_text`:
- Describes what's in the image, not "image of"
- Mentions the vehicle/brand/model when relevant
- Includes one location/context cue when natural (e.g. "exterior", "interior cocina")
- 60–125 characters
- Same alt across locales is acceptable (descriptive language is mostly language-neutral); but if a phrase is clearly Spanish-only, provide a per-locale variant via the admin

## Bad → Good examples

| Bad | Good |
|---|---|
| `vehiculo 1` | `Otti Bull McLouis MC4 72 - vista exterior frontal` |
| `image-2.jpg` | `McLouis MC4 72 - interior cocina con menaje incluido` |
| (empty) | `Roller Team Zefiro 685 - dormitorio doble trasero` |

## Vehicle images — current state

Apply via admin → Vehicle → Edit → Image alt text.

| Image ID | Vehicle slug | Cover? | Current alt | Proposed alt |
|---|---|---|---|---|
| (no current data — fill from admin during execution) | — | — | — | — |

> **Note:** DB query ran successfully but returned 0 rows — no vehicle images are stored yet (only a `test` vehicle exists with no associated images). Fill this table from the admin panel once real vehicles are published.

## Hero images — current state

Apply via admin → Hero images → Edit alt text.

| Image ID | Sort | Current alt | Proposed alt |
|---|---|---|---|
| 4851ef39-cc67-4246-98cb-e81594359870 | 0 | Carretera al atardecer | Autocaravana Otti Bull circulando por carretera al atardecer |
| 5f4eb500-f25a-4fff-80f0-0b1df1576d37 | 1 | Camper en montaña | Autocaravana Otti Bull aparcada en paisaje de montaña |
| b56012d3-9d99-4afb-9ef2-fd7e24c85232 | 2 | Furgoneta en costa | Furgoneta Otti Bull junto a la costa mediterránea |

## Owner workflow

1. Read the proposed alt for each row above
2. Open the admin panel for the vehicle/hero
3. Paste the new alt text
4. Save
5. Tick the row in this doc
