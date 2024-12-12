# BEAN - A Highly Parallel Isotachphoresis Calculator
**Manuscript in review!** 🟢🟢🟢🟢🟢🟢🟡🟡⚪️


Try BEAN out at [https://web.stanford.edu/group/microfluidics/bean/](https://web.stanford.edu/group/microfluidics/bean/)!

# File Structure
```sh
BEAN_ITP/
├── node_modules/ # Dependencies
├── public/
│   ├── index.html
│   └── ...
├── server/ # Server side code
│   ├── computations_v1/ # Initial computations & expirements in TensorFlow
│   ├── computations_v2/ # v2 computations for heatmaps
│   ├── computations_v3/ # Latest computations for heatmaps live on the site
│   ├── docker/          # Containarize python venv & dependencies 
│   ├── mobility_plot/   # generate the mobility plot 
│   ├── lambda_layers/   # Services to use .py dependencies (numpy, etc) in AWS Lambda
│   ├── utils/           # Helper functions for development & testing
│   └── ...
├── src/ # Client
│   ├── index.tsx        # Entrypoint 
│   ├── components/      # React components making up the BEAN GUI
│   ├── Contexts/        # Global state
│   ├── utils/           # Helper functions for development & testing
│   └── ...
├── README.md 
├── LICENSE
├── package.json
├── tsconfig.json
├── yarn.lock
```

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

Open [http://localhost:3000](http://localhost:3000) to view BEAN in the browser.
