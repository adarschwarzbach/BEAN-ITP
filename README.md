# BEAN - An Isotachphoresis Calculator

**Work in progres**
🟢🟡⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️

# File Strucutre

- BEAN_ITP/
  - node_modules/
  - public/
    - index.html
    - ...
  - server/
    - numpyLambdaLayer
  - src/
    - App.tsx
    - index.tsx
    - ...
  - package.json
  - tsconfig.json
  - README.md

# Project File Structure in Markdown

```bash
BEAN_ITP/
├── node_modules/
├── public/
│   ├── index.html
│   └── ...
├── server/
│   ├── numpyLambdaLayer/ (Service to use numpy in AWS)
│   ├── beanBackend.py (Lambda function for BEAN API)
│   ├── zipBackend.sh (Script to zip beanBackend.py)
│   ├── diffusion_free_model.py (Edited version of diffusion calculations)
│   └── ...
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   └── ...
├── README.md
├── package.json
├── tsconfig.json
├── yarn.lock


# To locally run the client
1. **Clone the Project:**

   ```sh
   git clone git@github.com:adarschwarzbach/BEAN-ITP.git

2. **Install dependencies:**
    ```sh
    cd BEAN-ITP
    yarn install

3. **Start local server:**
    ```sh
    yarn start

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
