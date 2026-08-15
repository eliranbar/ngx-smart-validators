# ngx-smart-validators workspace

Angular workspace for the `@ebdev/ngx-smart-validators` npm package and its showcase
application.

## Projects

- `projects/ngx-smart-validators` — publishable Angular 17–22 library
- `projects/demo` — interactive free/Pro validator showcase
- `tools/generate-license.mjs` — offline Ed25519 license issuer

## Commands

```bash
npm start             # serve the demo
npm run build         # build library and demo
npm run build:lib     # build the publishable package
npm test              # run library tests
npm run license -- --licensee "Acme" --domains "acme.com,*.acme.com"
npm run pack:dry-run  # inspect npm publish contents without publishing
```

For consumer documentation, see
[`projects/ngx-smart-validators/README.md`](projects/ngx-smart-validators/README.md).

## Licensing

This project is source-available. The free validators may be used in commercial
applications; Pro validators require a signed license. See [`LICENSE`](LICENSE).
