[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-c66648af7eb3fe8bc4f294546bfd86ef473780cde1dea487d3c4ff354943c9ae.svg)](https://classroom.github.com/online_ide?assignment_repo_id=8780035&assignment_repo_type=AssignmentRepo)

# D3-App-Template

A template for an interactive web application with D3

## Launch the app

```bash
yarn
yarn dev
```

This launches the app in developer mode. To run the app in production mode, run `yarn build` or see below.

## Code style

We recomme dusing VSCode for development. You can run `yarn lint` to check for linting errors.
Note that these tests automatically run when you comit your code to GitHub. See `test.yml` for details.
You can fix a lot of issues autoamtically with `yarn format`.

## Deployment

When you push to GitHub, the app automatically deploys to GitHub Pages. As an example, this template repositroy is deployed at [domoritz.github.io/D3-App-Template](https://domoritz.github.io/D3-App-Template/). See `deploy.yml` for details. Make sure to update the `base` property in `vit.config.ts` to match your repo name.

## Notes

- Uses [Vite](https://vitejs.dev/)
- Bootstrapped with `yarn create vite app --template vanilla-ts`
- Uses [D3](https://d3js.org/)
- Built with [TypeScript](https://www.typescriptlang.org/)
- Support [DuckDB-wasm](https://github.com/duckdb/duckdb-wasm)
