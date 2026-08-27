# Introduction

A web app to:

1. Preview and proofread the output of [jumlize](https://sr.ht/~rehandaphedar/jumlize) and [rabtize](https://sr.ht/~rehandaphedar/rabtize), as well as any future programs that output files of the format.
2. Manually segment an existing Qurʾān translation.
3. Manually map segments of an existing Qurʾān translation to word ranges.
4. Write new a new Qurʾān translation in a "digital first" manner compatible with [the Quranic Universal Library](https://qul.tarteel.ai/resources/translation), with segmentation and word range mapping support.

# Demo

A demo is available at [rabtize-studio.srht-site.rehandaphedar.com](https://rabtize-studio.srht-site.rehandaphedar.com).

# Deployment

Clone the repository and install dependencies:
```sh
git clone git@git.sr.ht:~rehandaphedar/rabtize-studio
cd rabtize-studio
pnpm install --frozen-lockfile
```

Development:
```sh
pnpm run dev
```

Production:
```sh
pnpm run build
```

Then, host `dist/` using any web server.

# Keybindings

Vim-like keybindings are available.

## Dashboard

When no element is focused:

| Key             | Action                        |
|-----------------|-------------------------------|
| `j`             | Select next verse             |
| `k`             | Select previous verse         |
| `g`             | Select first verse of chapter |
| `G`             | Select last verse of chapter  |
| `Enter` / `z`   | Open selected verse in editor |
| `Tab`           | Collapse/expand chapter       |
| `Shift` + `Tab` | Collapse all chapters         |
| `v`             | Focus verse key input         |
| `t`             | Import translation            |
| `T`             | Export translation            |
| `c`             | Cycle theme                   |


When the verse key input is focused:

| Key      | Action                              |
|----------|-------------------------------------|
| `Enter`  | Select entered verse key (if valid) |
| `Escape` | Blur focus from the input           |


## Editor

### Normal Mode

Common keybindings:

| Key          | Normal                   |
|--------------|--------------------------|
| `i`          | Enter insert mode        |
| `g`          | Select first segment     |
| `G`          | Select last segment      |
| `u`          | Undo                     |
| `Ctrl` + `r` | Redo                     |
| `h`          | Switch to previous verse |
| `l`          | Switch to next verse     |
| `z` / `q`    | Switch to dashboard      |


When the complete translation is selected:

| Key | Normal                |
|-----|-----------------------|
| `i` | Enter insert mode     |
| `j` | Select first segment  |
| `a` | Append segment at end |


When a segment is selected:

| Key | Normal                               |
|-----|--------------------------------------|
| `m` | Enter mapping mode                   |
| `t` | Select complete translation          |
| `j` | Select next segment                  |
| `k` | Select previous segment              |
| `a` | Append segment after selected        |
| `A` | Prepend segment before selected      |
| `d` | Delete selected segment              |
| `s` | Merge selected segment with next     |
| `S` | Merge selected segment with previous |
| `J` | Swap selected segment with next      |
| `K` | Swap selected segment with previous  |
| `x` | Clear word range of selected segment |


Changes made during an insert or mapping mode session are recorded as a single history entry when the mode is exited.
	
### Insert Mode

| Key              | Action                          |
|------------------|---------------------------------|
| `Escape`         | Exit insert mode                |
| `Ctrl` + `Enter` | Split current segment at cursor |


### Mapping Mode

| Key      | Action                  |
|----------|-------------------------|
| `h`      | Extend end of range     |
| `H`      | Shorten start of range  |
| `l`      | Extend start of range   |
| `L`      | Shorten end of range    |
| `Enter`  | Apply mapping and exit  |
| `x`      | Clear mapping and exit  |
| `Escape` | Cancel mapping and exit |

Applying a mapping resolves overlaps with other segments.
