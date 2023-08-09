# TensorFlow implementation of the BEAN model
# Will likely not use this method



import argparse
import os
import uuid


from pathlib import Path
import tensorflow as tf

F = 96500.0e0             # C / mol
met2lit = 1000.0e0
Rmu = 8.314e0
Temperature = 298.0e0
muH = 362e-9
muOH = 205e-9
visc = 1e-3  # Dynamic viscosity (water) (Pa s)


class BeanInit(tf.Module):
    def __init__(self):
        super(BeanInit, self).__init__()


    @tf.function(input_signature=[
        {
            'valence': tf.TensorSpec(shape=[None], dtype=tf.float64),
            'mobility': tf.TensorSpec(shape=[None], dtype=tf.float64),
            'pKa': tf.TensorSpec(shape=[None], dtype=tf.float64),
            'concentration': tf.TensorSpec(shape=[], dtype=tf.float64),
            'type': tf.TensorSpec(shape=[], dtype=tf.string),
        }
    ])
    def TFEquilibriumParameters(self, species, Rmu=8.314, F=96500, Temperature=298):
        # Calculates parameters for chemical equilibrium calculation
        Rmu = tf.cast(Rmu, dtype=tf.float64)
        F = tf.cast(F, dtype=tf.float64)
        Temperature = tf.cast(Temperature, dtype=tf.float64)
        MaxCol = 1
        for j in species:
            num_mobility = len(species[j]['mobility'])
            if num_mobility > MaxCol:
                MaxCol = num_mobility
        MaxCol = MaxCol + 1
        Nspecies = len(species)

        LMat = tf.zeros_like([[_ for _ in range(MaxCol)] for _ in range(Nspecies)], dtype=tf.float64)  # initialize to zero.

        zListArranged = {}
        index = 0
        zMat_list = []
        muMat_list = []
        KaMat_list = []
        DMat_list = []


        zMat = tf.constant([], dtype=tf.int32)
        muMat = tf.constant([], dtype=tf.float64)
        KaMat = tf.constant([], dtype=tf.float64)
        DMat = tf.constant([], dtype=tf.float64)

        for j in species:
            zList = tf.constant(species[j]['valence'], dtype=tf.float64)
            muList = tf.constant(species[j]['mobility'], dtype=tf.float64)
            KaList = tf.constant(10.0, dtype=tf.float64)**(-tf.constant(species[j]['pKa'], dtype=tf.float64))
            DList = Rmu * Temperature * muList / (F * zList)  # diffusivity


            index = tf.argsort(zList)  # sort all lists
            zList = tf.gather(zList, index)
            muList = tf.gather(muList, index)
            KaList = tf.gather(KaList, index)
            DList = tf.gather(DList, index)

            muList = tf.concat([tf.boolean_mask(muList, zList < 0), [0.0], tf.boolean_mask(muList, zList > 0)], axis=0)
            KaList = tf.concat([tf.boolean_mask(KaList, zList < 0), [1.0], tf.boolean_mask(KaList, zList > 0)], axis=0)
            # For calculating mean, use tf.reduce_mean.
            DList = tf.concat([tf.boolean_mask(DList, zList < 0), [tf.reduce_mean(DList)], tf.boolean_mask(DList, zList > 0)], axis=0)
            # Make sure to convert 0 to the same dtype as zList to avoid possible dtype mismatch.
            zero_tensor = tf.constant([0], dtype=zList.dtype)
            zList = tf.concat([tf.boolean_mask(zList, zList < 0), zero_tensor, tf.boolean_mask(zList, zList > 0)], axis=0)
            
            zMat_list.append(zList)
            muMat_list.append(muList)
            KaMat_list.append(KaList)
            DMat_list.append(DList)
            zListArranged[j] = tf.cast(zList, dtype=tf.int32)
            nj = tf.reduce_min(zList)
            pj = tf.reduce_max(zList)

            for z in zList:
                indices  = [j, z-nj]
                value = [1.0]
                shape = [Nspecies, MaxCol]
                if z < 0:
                    value = [tf.reduce_prod(KaList[tf.cast(z, tf.int32)-tf.cast(nj, tf.int32)])]
                elif z > 0:
                    value = [1.0/tf.reduce_prod(KaList[-tf.cast(nj, tf.int32):tf.cast(z, tf.int32)-tf.cast(nj, tf.int32)+1])]
                indices = [tf.cast(idx, tf.int32) for idx in indices]  # Cast indices to int32
                updates = [value[0]]  # Extract the single value from the 'value' list
                LMat = tf.tensor_scatter_nd_update(LMat, [indices], updates)

        
        zMat = tf.stack(zMat_list)
        muMat = tf.stack(muMat_list)
        KaMat = tf.stack(KaMat_list)
        DMat = tf.stack(DMat_list)

        ## Convert to NumPy arrays For testing ##

        # LMat_numpy = LMat.numpy()
        # muMat_numpy = muMat.numpy()
        # zMat_numpy = zMat.numpy()
        # DMat_numpy = DMat.numpy()
        # KaMat_numpy = KaMat.numpy()

        # # Convert the dictionary values to NumPy arrays
        # zListArranged_numpy = {key: np.array(value) for key, value in zListArranged.items()}

        # # Now return the NumPy arrays
        # return LMat_numpy, muMat_numpy, zMat_numpy, DMat_numpy, KaMat_numpy, zListArranged_numpy, MaxCol

        return LMat, muMat, zMat, DMat, KaMat, zListArranged, MaxCol


def parse_args():
    print('test')
    parser = argparse.ArgumentParser()
    parser.add_argument('-o', '--output', type=str, default='./',
                        help='directory to store the output model')
    return parser.parse_args()

def save_tf_model(model, output_dir, name):
    import tensorflowjs as tfjs
    path = os.path.join('/tmp', str(uuid.uuid4()))
    tf.saved_model.save(model, path)
    tfjs.converters.convert_tf_saved_model(path, os.path.join(output_dir, name),
        strip_debug_ops=True, control_flow_v2=True)
    

if __name__ == '__main__':
    args = parse_args()
    # make sure output path exist
    Path(args.output).mkdir(parents=True, exist_ok=True)
    save_tf_model(BeanInit(), args.output, 'bean-init')

    