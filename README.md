# ✨ PRG Scratch Extension Development Environment

This repository is your one-stop-shop for developing scratch extensions for PRG curricula.

It's a fullblown [fork](https://en.wikipedia.org/wiki/Fork_(software_development)) of the official Scratch codebase, which the [Personal Robotics Group](https://robots.media.mit.edu/) (PRG) manages and extends to meet its needs. 

## ⚡ Quick Start


### Project setup

Assuming:
- Node 16 is installed (if not, jump to: ...)

Run the following from the command line (NOTE: Check on windows git-bash):

```shell script
git clone git@github.com:mitmedialab/prg-extension-boilerplate.git
# Cloning the full history (300mb) takes about 20 seconds on fast internet. Include -–depth 1 for a 4 second checkout

cd prg-extension-boilerplate/
# change directory (cd) to the repository

npm run init
# This will symlink the packages together to allow for seamless local development, and installs dependencies for each package. This should only need to be ran once (unless you checkout a branch that adds new package dependencies).
# Takes about 1.5 minutes

npm run dev
# This starts up a development server, serving all the currently implemented extensions
# Open http://localhost:8601/ in your browser
```

### Making your extension

```shell script
npm run new:extension <folder>
# for example: npm run new:extension my_awesome_extension

npm run dev
```

Now you can make changes, and they will auto-build from the scratch-gui watcher and live-reload!

- render, gui, and vm will auto-build while `scratch-gui`'s `npm start` is running (as in steps above)
- the blocks component currently requires fully building and re-starting the GUI build:
    ```shell script
    # Make your change to scratch-blocks, then:
    npm run rebuild:blocks
    ```
  
Alternatively, use GitPod!

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/mitmedialab/prg-extension-boilerplate)

### 🤔 Troubleshooting

#### If you see `sh: webpack: command not found`:

```shell script
> scratch-render@0.1.0 build /Users/brian/code/aied/test/test2/packages/scratch-render
> webpack --progress --colors
sh: webpack: command not found
```

**Solution**: This may mean you have a half-installed node_modules version of webpack. Try starting fresh!

## 💡 How this was made:

### Sub-packages

This project uses [`lerna`](https://github.com/lerna/lerna) as a utility to import npm packages with their git history (relatively) intact. That way stuff like `git log` and `git blame` will continue to provide a bit of insight into why code in the repository is the way it is! 

```shell script
npx lerna init
cd .. && mkdir scratch-fresh && cd scratch-latest
git clone https://github.com/LLK/scratch-vm.git
git clone https://github.com/LLK/scratch-gui.git
git clone https://github.com/LLK/scratch-render.git
git clone https://github.com/LLK/scratch-blocks.git
cd prg-extension-boilerplate
npx lerna import ../scratch-latest/scratch-vm --preserve-commit --flatten 
npx lerna import ../scratch-latest/scratch-gui --preserve-commit --flatten 
npx lerna import ../scratch-latest/scratch-render --preserve-commit --flatten 
npx lerna import ../scratch-latest/scratch-blocks --preserve-commit --flatten 
```

### Deployment

We use GitHub Actions to build the combined scratch-gui using `npm`, and [actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) to deploy to GitHub Pages.

Note that there is a step of adding an access token to the repository due to a bug with GitHub Actions. [Follow the steps here](https://github.com/marketplace/actions/deploy-to-github-pages#configuration-) to add an access token to your repository.

## 😸 Caveats

Eventually, work on Scratch Extensions may supersede this project's utility! This repo is most convenient for projects that can't accomplish what they need to within the Extensions framework.

Note the [`LICENSE`](packages/scratch-gui/LICENSE)s and especially [`TRADEMARK`](packages/scratch-gui/TRADEMARK)s for each Scratch component project carefully — e.g., you may not use the Scratch name, logo, cat, etc. in derivative projects without permission.  
