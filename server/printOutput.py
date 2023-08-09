"""
Script to print the output file from Supreet's diffusion free model
"""

import numpy as np

# File path
file_path = "/Users/adarschwarzbach/dev/BEAN-ITP/PythonSolver/output/output_sample_file_4.npz"

# Load the .npz file
loaded_data = np.load(file_path)

# Access and print all arrays in the file
for key in loaded_data:
    print(f"Array name: {key}")
    print(loaded_data[key])
    print("---") 