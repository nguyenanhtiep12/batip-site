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

The launch phase uses GitHub Pages with GitHub Actions. The repository contains `CNAME` with:

```text
batip.app
```

Because custom GitHub Actions workflows do not automatically configure the custom domain from `CNAME`, set the custom domain in GitHub:

```text
Repository Settings -> Pages -> Custom domain -> batip.app
```

Set Pages source to GitHub Actions.

## DNS

Configure the `batip.app` apex domain with GitHub Pages `A` records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

After DNS resolves, enable HTTPS in GitHub Pages.
