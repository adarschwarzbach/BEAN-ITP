# BEAN - An Isotachphoresis Calculator
**Work in progress** 🟢🟢🟢🟡⚪️⚪️⚪️⚪️⚪️⚪️⚪️


Try it out [here](https://adarschwarzbach.github.io/BEAN-ITP/)!

# File Structure
```sh
BEAN_ITP/
├── node_modules/
├── public/
│   ├── index.html
│   └── ...
├── server/
│   ├── docker/ # Containarize python venv & dependencies 
│   │   └── ...
│   ├── numpyLambdaLayer/ # Service to use numpy in AWS
│   │   └── ...
│   ├── beanBackend.py # AWS Lambda function for BEAN API
│   ├── zipBackend.sh # Script to zip beanBackend.py
│   ├── diffusion_free_model.py # Edited version of diffusion calculations
│   ├── printOutput.py # Script to print .npz otput files from the model
│   └── ...
├── src/ # Client
│   ├── App.tsx
│   ├── index.tsx
│   └── ...
├── README.md
├── package.json
├── tsconfig.json
├── yarn.lock
```

# To locally run the client 
(once client is completed)

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

Open [http://localhost:3000](http://localhost:3000) to view BEAN in the browser.
