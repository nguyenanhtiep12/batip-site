# BaTip Site

Static source for the future `batip.app` website.

## Status

This repository is being built separately from the existing `batip-support` site. Do not point production traffic here until the site has been reviewed.

## Commands

```sh
npm run build
npm run check
npm run serve
```

The local server serves the generated `dist/` folder at:

```text
http://localhost:4173/
```

## Launch Later

The launch phase should add `CNAME` with:

```text
batip.app
```

Then configure GitHub Pages and DNS.
