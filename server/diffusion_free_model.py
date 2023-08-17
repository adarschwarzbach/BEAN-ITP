'''
This is a modified version of the diffusion_free_model.py from Supreet
'''
import numpy as np
import matplotlib.pyplot as plt
import os
import sys
from time import time
import pprint

import tensorflow as tf

# species = { 0: {'Name': 'Imidazol', 'valence': [1], 'mobility': [52.0e-9], 
# 		'pKa': [7.15], 'concentration': 0.07, 'type': 'LE'},
# 	    1: {'Name': 'HCl', 'valence': [-1], 'mobility': [-79.1e-9], 
# 		'pKa': [-2], 'concentration': 0.03, 'type': 'Background'}, 
	    # 2: {'Name': 'BisTris', 'valence': [1], 'mobility': [29.5e-9], 
		# 'pKa': [6.4], 'concentration': 0.01, 'type': 'Analyte'},
	    # 3: {'Name': 'Pyridine', 'valence': [1], 'mobility': [29.5e-9], 
		# 'pKa': [5.18], 'concentration': 0.1, 'type': 'TE'}, 
	# }	


# START GLOBALS
# species = { 0: {'Name': 'HCl', 'valence': [-1], 'mobility': [-79.1e-9], 
# 		'pKa': [-2], 'concentration': 0.01, 'type': 'LE'},
# 	    1: {'Name': 'Tris', 'valence': [1], 'mobility': [29.5e-9], 
# 		'pKa': [8.076], 'concentration': 0.02, 'type': 'Background'}, 
# 	    2: {'Name': 'MOPS', 'valence': [-1], 'mobility': [-26.9e-9], 
# 		'pKa': [7.2], 'concentration': 0.001, 'type': 'Analyte'},
# 	    3: {'Name': 'HEPES', 'valence': [-1], 'mobility': [-23.5e-9], 
# 		'pKa': [7.5], 'concentration': 0.005, 'type': 'TE'}, 
# 	}


species = { 0: {'Name': 'HCl', 'valence': [-1], 'mobility': [-79.1e-9], 
		'pKa': [-2], 'concentration': 0.01, 'type': 'LE'},
	    1: {'Name': 'Tris', 'valence': [1], 'mobility': [29.5e-9], 
		'pKa': [8.076], 'concentration': 0.02, 'type': 'Background'}, 
	    2: {'Name': 'MOPS', 'valence': [-1], 'mobility': [-26.9e-9], 
		'pKa': [7.2], 'concentration': 0.001, 'type': 'Analyte'},
	    3: {'Name': 'Sebacic-Acid', 'valence': [-2, -1], 'mobility': [-4.49e-008, -2.07e-008 ], 'pKa': [5.38, 4.53], 'concentration': 0.00021, 'type': 'TE'}
	}

def create_cMat(species):
    Nspecies = len(species)
    cMat_read = np.zeros((Nspecies, Nspecies)) #initialize cMat to zero

    for key, value in species.items():
        if value['type'] == 'LE':
            cMat_read[key,0] = value['concentration']
        elif value['type'] == 'Background':
            cMat_read[key,:] = value['concentration']
        elif value['type'] == 'Analyte':
            cMat_read[key,1] = value['concentration']
        elif value['type'] == 'TE':
            cMat_read[key,2:] = value['concentration']

    return cMat_read



met2lit = 1000.0
N = 4
Nspecies = len(species) 
# cMat_read = np.zeros((Nspecies,N)) #initialize cMat to zero
# cMat_read[0,0] = species[0]['concentration']
# cMat_read[1,:] = species[1]['concentration']
# cMat_read[2,1] = species[2]['concentration']
# cMat_read[3,2:] = species[3]['concentration']
cMat_read = create_cMat(species)
# END GLOBALS
print(cMat_read)
print('new \n', create_cMat(species))

F = 96500.            # C / mol
met2lit = 1000.0e0
Rmu = 8.314e0
Temperature = 298.0e0
muH = 362e-9
muOH = 205e-9
visc = 1e-3  # Dynamic viscosity (water) (Pa s)


def InitialConditions():
    # # reads input file and assigns values to various simulation variables and parameters
    # f = open(filename)

    # input_lines = ''
    # for line in f:                         # loop over the file
    #     line = line.lstrip('\n')  # strip lines of left indents/whitespace
    #     input_lines = input_lines + line  # join all lines in input file

    # # announce global variables to be modified
    # exec(input_lines, globals())
    # f.close()

    # print(met2lit, cMat_read)
    cMat = cMat_read*met2lit  # Convert from mol/lit to mol/m^3
    cMat_init = np.copy(cMat)
    LMat, muMat, ValMat, DMat, KaMat, zListArranged, PolDeg = EquilibriumParameters(
        species)
    
    # check = TFEquilibriumParameters(species)
    # check2 = EquilibriumParameters(species)
    # print( check == check2)

    mu_max = abs(muMat).max()
    D_max = DMat.max()
    c_max = cMat.max()

    muCube = np.tile(np.reshape(muMat, (Nspecies, 1, PolDeg)),
                     (1, N, 1))  # mobilities
    DCube = np.tile(np.reshape(DMat, (Nspecies, 1, PolDeg)),
                    (1, N, 1))  # diffusivities
    ValCube = np.tile(np.reshape(
        ValMat, (Nspecies, 1, PolDeg)), (1, N, 1))  # valence
    LCube = np.tile(np.reshape(LMat, (Nspecies, 1, PolDeg)), (1, N, 1))

    # Used in Newquillibirium function
    KaListCube = np.tile(np.reshape(KaMat, (Nspecies, 1, PolDeg)), (1, N, 1))
    Kw = 1.0e-14
    cH = 10.0**(-7.0)*np.ones((1, N))  # set initial [H+] = 0 in mol/litre

    ref_values = {'concentration': c_max, 'mobility': mu_max, 'diffusivity': D_max,
                  'conductivity': mu_max*c_max*F,
                  'diffusive_current': D_max*c_max*F}

    # nondimensionalize concentration, x, t, mobility, current, diffusivity, conductivity diffusive_current
#   cMat = NonDimensionalize(cMat, 'concentration', ref_values)
#   muCube = NonDimensionalize(muCube, 'mobility', ref_values)
#   DCube = NonDimensionalize(DCube, 'diffusivity', ref_values)

    return cMat, cMat_init, muCube, DCube, ValCube, LCube, KaListCube, PolDeg, zListArranged, ref_values, species, N, Nspecies, Kw, cH


def NonDimensionalize(x, quantity, ref_values):
    # function to non-dimensionalize quantity with its reference value
    y = x/ref_values[quantity]
    return y


def Dimensionalize(x, quantity, ref_values):
    # function to dimensionalize a quantity with its reference value
    y = x*ref_values[quantity]
    return y


def TFEquilibriumParameters(species, Rmu=8.314, F=96500, Temperature=298):
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

    zMat = pad_and_stack(zMat_list)
    muMat = pad_and_stack(muMat_list)
    KaMat = pad_and_stack(KaMat_list)
    DMat = pad_and_stack(DMat_list)

    # # Convert to NumPy arrays For testing ##

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

# Helper function to pad and stack a list of tensors
def pad_and_stack(tensor_list):
    max_len = max([len(t.numpy()) for t in tensor_list])
    tensor_list_padded = [tf.pad(t, paddings=[[0, max_len - len(t.numpy())]]) for t in tensor_list]
    return tf.stack(tensor_list_padded)




def EquilibriumParameters(species):
    # Calculates parameters for chemical equilibrium calculation
    MaxCol = 1
    for j in species:
        num_mobility = len(species[j]['mobility'])
        if num_mobility > MaxCol:
            MaxCol = num_mobility
    MaxCol = MaxCol + 1

    Nspecies = len(species)
    LMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
    zMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
    muMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
    KaMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
    DMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.

    zListArranged = {}

    for j in species:
        zList = np.array(species[j]['valence'], int)
        muList = np.array(species[j]['mobility'], float)
        KaList = 10.0**(-np.array(species[j]['pKa'], float))
        DList = Rmu*Temperature*muList/(F*zList)  # diffusivity


        index = np.argsort(zList)  # sort all lists
        zList = zList[index]
        muList = muList[index]
        KaList = KaList[index]
        DList = DList[index]


        muList = np.concatenate(
            (muList[zList < 0], [0.0], muList[zList > 0]), axis=0)
        KaList = np.concatenate(
            (KaList[zList < 0], [1.0], KaList[zList > 0]), axis=0)
        DList = np.concatenate(
            (DList[zList < 0], [np.mean(DList)], DList[zList > 0]), axis=0)
        # zList at end to avoid changing in zList
        zList = np.concatenate(
            (zList[zList < 0], [0], zList[zList > 0]), axis=0)
        

        N_list = len(zList)

        zMat[j, 0:N_list] = zList
        muMat[j, 0:N_list] = muList
        KaMat[j, 0:N_list] = KaList
        DMat[j, 0:N_list] = DList
        zListArranged.update({j: zMat[j].astype(int)})

        nj = np.min(zList)
        pj = np.max(zList)

        # print(DMat, 'np \n')

        '''
    E.g. if z = [-2, -1, 0, 1, 2, 3]
    nj = -2 
    pj = 3
    
    '''
        for z in zList:
            if z < 0:
                LMat[j, z-nj] = np.prod(KaList[z-nj:-nj])
            elif z > 0:
                LMat[j, z-nj] = 1.0/np.prod(KaList[-nj:z-nj+1])
            elif z == 0:
                LMat[j, z-nj] = 1.0
    return LMat, muMat, zMat, DMat, KaMat, zListArranged, MaxCol


# lz_func(self, cH_n, c_mat_sn, l_mat_sd, val_mat_sd):

def LzFunc(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw, approx_factor):
    # Equation for iterative solution of pH

    cHPolMat = np.append(np.ones((1, N)), np.cumprod(
        np.dot(np.ones((PolDeg-1, 1)), cH), axis=0), axis=0)  # size = PolDeg x N

    # size = Nspecies x N x PolDeg
    cHCubePower = np.tile(np.array([np.transpose(cHPolMat)]), (Nspecies, 1, 1))
    # sum over z. size = Nspecies x N
    TempMat = np.sum(LCube*cHCubePower, axis=2)
    TempCube = np.tile(TempMat.reshape(Nspecies, N, 1), (1, 1, PolDeg))

    M1Cube = np.tile((cMat/TempMat).reshape(Nspecies, N, 1), (1, 1, PolDeg))
    cizCube = LCube*cHCubePower*M1Cube  # equation 5 in J. Chroma A

    Temp_z = np.sum((ValCube*LCube*cHCubePower), axis=2)
    Temp_z_Cube = np.tile(Temp_z.reshape(Nspecies, N, 1), (1, 1, PolDeg))
    RHS_den = np.sum(np.sum((cizCube*ValCube**2.0
                             - approx_factor*cizCube*ValCube*Temp_z_Cube/TempCube), axis=2), axis=0)

    RHS_num = np.sum(np.sum((cizCube*ValCube), axis=2), axis=0)
    F_num = RHS_num+cH-Kw/cH

    F_den = RHS_den/cH+1.0+Kw/(cH**2)
    F = F_num/F_den
    return F



def LzCalcEquilibrium(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw):
    # Function to calculate chemical equilibrium

    cMat = cMat/met2lit  # cMat=cMat/met2lit; convert from mole/m^3 to mole/litre
    cHPrev = np.ones((1, N))
    cH_back = np.copy(cH)
    count = 0
    while np.linalg.norm((cHPrev-cH)/np.max(np.append(cH, cHPrev))) > 1.0e-6:
        count = count+1
        cHPrev = cH
        cH = cH - LzFunc(cH, LCube, cMat, ValCube,
                         PolDeg, N, Nspecies, Kw, 1.0)

    if np.min(cH) < 0.0:  # do slow but robust iterations if cH is -ve
        cHPrev = np.ones((1, N))
        cH = cH_back
        count = 0
        while np.linalg.norm((cHPrev-cH)/np.max(np.append(cH, cHPrev))) > 1.0e-6:
            count = count+1
            cHPrev = cH
            cH = cH - LzFunc(cH, LCube, cMat, ValCube,
                             PolDeg, N, Nspecies, Kw, 0.0)

    cHPolMat = np.append(np.ones((1, N)), np.cumprod(
        np.dot(np.ones((PolDeg-1, 1)), cH), axis=0), axis=0)  # size = PolDeg x N
    # size = Nspecies x N x PolDeg
    cHCubePower = np.tile(np.array([np.transpose(cHPolMat)]), (Nspecies, 1, 1))
    # sum over z. size = Nspecies x N
    TempMat = np.sum(LCube*cHCubePower, axis=2)
    TempCube = np.tile(TempMat.reshape(Nspecies, N, 1), (1, 1, PolDeg))

    # M1Cube is denominator of eqn 5
    M1Cube = np.tile((cMat/TempMat).reshape(Nspecies, N, 1), (1, 1, PolDeg))
    cizCube = LCube*cHCubePower*M1Cube  # equation 5 in J. Chroma A
    gizCube = LCube*cHCubePower/TempCube

    return cizCube, cH, cHCubePower, gizCube
    
# (1) New added
def Myheaviside(X):
    Y = np.zeros(len(X))
    Y[X > 0] = 1
    Y[X == 0] = 'NaN'
    return Y
# (2) New Added


def RecomputeEquilibrium(zListArranged, NewKaListCube, Nspecies, N, PolDeg):
    # function to calculate equillibirum again called in Onsager function
    LCube = np.zeros((Nspecies, N, PolDeg))
    for k in range(N):
        for j in range(Nspecies):
            zList = zListArranged[j]
            KaList_new = NewKaListCube[j, k, :]
            nj = np.min(zList)
            for z in zList:
                if z < 0:
                    LCube[j, k, z-nj] = np.prod(KaList_new[z-nj:-nj])
                elif z > 0:
                    LCube[j, k, z-nj] = 1/np.prod(KaList_new[-nj:z-nj+1])
                elif z == 0:
                    LCube[j, k, z-nj] = 1.0
    return LCube

# (3) New added


def getLogActivity(IonicStrength):
    # Function to find pH based on IonicStrength
    y = -0.5085*(np.sqrt(IonicStrength) /
                 (1+1.5*np.sqrt(IonicStrength))-0.1/0.5085*IonicStrength)
    return y

# modified


def CalcSpatialProperties(IonicCalcFlag, IonicEffectFlag, cH, cMat_nd, LCube, KaListCube, ValCube, zListArranged, muCube_nd, DCube_nd, PolDeg, N, Nspecies, Kw, ref_values):
    # Calculates spatial properties such as mobilitiy, diffusivity, conductivity based on concentrations
    # takes in nondimensional quantities, returns non-dimensional quantitites.
    #_nd: non-dimensional
    # _d: dimensional units
    # global IonicStrength, Kw_new  # , muIonicCube
    muCube_d = muCube_nd  # Dimensionalize(muCube_nd,'mobility',ref_values)
    cMat_d = cMat_nd  # cMat_nd*ref_values['concentration']
    # print('cH3',cH)
    cizCube, cH, cHCubePower, gizCube = LzCalcEquilibrium(
        cH, LCube, cMat_d, ValCube, PolDeg, N, Nspecies, Kw)
    # if IonicCalcFlag == 1:
    # print('cH1', cH)
    cizCube, cH, cHCubePower, gizCube, IonicStrength, LCube = CalculateIonicEffects(
        IonicEffectFlag, N, Nspecies, PolDeg, cH, LCube, KaListCube, cMat_d, ValCube, zListArranged, cizCube, cHCubePower, Kw, gizCube)
    # Calculate new effective mobility
    muIonicCube = OnsagerFuoss(
        IonicEffectFlag, ValCube, cizCube, muCube_d, Nspecies, N, PolDeg)

    ICube = np.tile(np.reshape(IonicStrength, (1, N, 1)),
                    (Nspecies, 1, PolDeg))

    muMat_nd = np.sum(muIonicCube*gizCube, axis=2)
#   muMat_nd =  np.sum(NonDimensionalize(muIonicCube,'mobility',ref_values)*gizCube, axis = 2)

    DTemp = DCube_nd*(1-0.2297*np.sqrt(ICube))

    DMat_nd = np.sum(DTemp*gizCube, axis=2)
    Kw_new = Kw*10**(-2*getLogActivity(IonicStrength*IonicEffectFlag))
    muH_new = muH
    muOH_new = muOH

    alphaMat = F*np.sum(ValCube*muIonicCube*gizCube, axis=2)
    betaMat = F*np.sum(ValCube*DTemp*gizCube, axis=2)
#   betaMat =  F*np.sum(ValCube*Dimensionalize(DTemp, 'diffusivity', ref_values)*gizCube, axis = 2)
    SigVec_d = np.sum(alphaMat*cMat_d, axis=0) + F*met2lit * \
        (muH_new*cH + muOH_new*Kw_new/cH)
    SVec_d = np.sum(betaMat*cMat_d, axis=0) + F*(Rmu*Temperature/F) * \
        met2lit*(muH_new*cH - muOH_new*Kw_new/cH)

    SigVec_nd = SigVec_d  # /ref_values['conductivity']
    SVec_nd = SVec_d  # /ref_values['diffusive_current']
    # *ref_values['concentration']/ref_values['conductivity']
    # print('cH2', cH)
    alphaMat_nd = alphaMat
    if IonicEffectFlag == 1:
        pH = -np.log10(cH*10**getLogActivity(IonicStrength))
    else:
        pH = -np.log10(cH)
    return cH, muMat_nd, DMat_nd, SigVec_nd, SVec_nd, alphaMat_nd, pH, IonicStrength


def CalculateIonicEffects(IonicEffectFlag, N, Nspecies, PolDeg, cH, LCube, KaListCube, cMat_d, ValCube, zListArranged, cizCube, cHCubePower, Kw, gizCube):
    # Function to calculate Ionic Strength
    Kw_new = Kw*np.ones((1, N))
    if IonicEffectFlag == 0:
        IonicStrength = np.zeros((1, N))

    elif IonicEffectFlag == 1:
        convergence = False
        count = 0
        while not convergence:
            if count > 40:
                print('no convergence in Ionic Effects')
                break
            count = count+1
            cHPrev = cH
            IonicStrength = 0.5 * \
                (np.sum(np.sum(ValCube**2*cizCube, axis=2), axis=0) + cH+Kw_new/cH)

            pKaFactor = -getLogActivity(IonicStrength)
            zListHeavy = {}

            for i in range(Nspecies):
                zListHeavy.update(
                    {i: zListArranged[i]-Myheaviside(zListArranged[i]-0.1)})

            NewKaListCube = np.zeros((Nspecies, N, PolDeg))
            for k in range(N):
                for i in range(Nspecies):
                    NewKaListCube[i, k, :] = KaListCube[i, k, :] * \
                        10**(-pKaFactor[0, k]*2.0*zListHeavy[i])

            LCube = RecomputeEquilibrium(
                zListArranged, NewKaListCube, Nspecies, N, PolDeg)
            Kw_new = Kw*10**(2*pKaFactor)
            cizCube, cH, cHCubePower, gizCube = LzCalcEquilibrium(
                cH, LCube, cMat_d, ValCube, PolDeg, N, Nspecies, Kw_new)
            if np.linalg.norm((cHPrev-cH)/np.max(np.append(abs(cH), abs(cHPrev)))) < 1e-6:
                convergence = True
                break
        IonicStrength = IonicEffectFlag*0.5 * \
            (np.sum(np.sum(ValCube**2*cizCube, axis=2), axis=0)+cH+Kw_new/cH)
    return cizCube, cH, cHCubePower, gizCube, IonicStrength, LCube
# (5) New added


def OnsagerFuoss(IonicEffectFlag, ValCube, cizCube, muCube_d, Nspecies, N, PolDeg):
 # function to find the new effective mobility
    muIonicCube = np.copy(muCube_d)
    if (IonicEffectFlag == 0):
        pass  # return muIonicCube

    elif (IonicEffectFlag == 1):

        # extract the non zero elements
        X = np.nonzero(ValCube[:, 0, :])
        # need to do this for one matrix only
        # same for all grid points

        # muCube is actually Omega in Onsage-Fuoss paper and is same for
        # all grid points
        # coefficients in onsager-fuoss paper
        c = np.array([0.2929, -0.3536, 0.0884, -0.0442, 0.0276, -0.0193])
        omega = np.zeros((1, len(X[0])))
        z = ValCube[X[0], 0, X[1]]
        XLen = len(X[0])
        mob = np.reshape(np.absolute(muCube_d[X[0], 0, X[1]]/F), (1, XLen))
        omega = mob/abs(z)

        mob_new = np.zeros((1, XLen))
        conc = np.zeros((1, XLen))  # concentrations

        II = np.eye(XLen, XLen)

        for k in range(N):

            conc = cizCube[X[0], k, X[1]]

            IonicStr = np.sum(conc*(z**2))
            mu = np.reshape(conc*z**2/IonicStr, (1, XLen))

            # now make matrix h
            h = np.zeros((XLen, XLen))

            h = np.multiply(mu, omega)/np.add((omega),
                                              np.repeat(np.transpose(omega), XLen, axis=1))

            d = np.sum(h, axis=1)
            d1 = np.diag(d)
            h = h + d1  # makes matrix h.. adds the delta_(i,j) terms

            B = 2*h-II

            r = np.zeros((XLen, len(c)))

            # check for absolute signs
            r[:, 0:1] = np.transpose(
                z-np.sum(z*mu)/np.sum(mu*np.absolute(z)/mob)*(np.absolute(z)/mob))

            for i in range(1, len(c)):

                r[:, i] = np.dot(B, r[:, i-1])

            # factors computed in table 3, page 2755 of Onsager-Fuoss
            factor = np.dot(c, np.transpose(r))

            # Now compute the ionic strength dependence of mobility
            mob_new = z*(F*omega-(0.78420*F*z*factor*omega+31.410e-9)
                         * np.sqrt(IonicStr/2)/(1+1.5*np.sqrt(IonicStr/2)))

            # Assemble matrix back
            for i in range(XLen):
                muIonicCube[X[0][i], k, X[1][i]] = mob_new[0, i]
    return muIonicCube


def SteadyFuncAnalyteIonic(x, gamma, cH):

    cMat[1, 1] = x[0]
    cMat[2, 1] = x[1]
    cH, muMat_nd, DMat_nd, SIGMA_nd, _, alphaMat_nd, pH, IonicStrength = \
        CalcSpatialProperties(IonicCalcFlag, IonicEffectFlag, cH, cMat, LCube, KaListCube, ValCube, zListArranged,
                              muCube, DCube, PolDeg, N, Nspecies, Kw, ref_values)  # calculate mobilities, conductivity at initial condition
    temp = np.zeros(2)
    # print('Hii')
    temp[0] = cMat[1, 0]*(muMat_nd[1, 0]/muMat_nd[0, 0]-1) / \
        (muMat_nd[1, 1]/muMat_nd[2, 1]-1)
    Sigvec_new = muMat_nd[2, 1]/muMat_nd[0, 0]*SIGMA_nd[0, 0]

    Kw_new = Kw*10**(-2*getLogActivity(IonicStrength*IonicEffectFlag))
    temp[1] = (Sigvec_new-(alphaMat_nd[1, 1]*temp[0]+F*(muH*cH[0, 1]
               * met2lit+muOH*(Kw_new[0, 1]/cH[0, 1])*met2lit)))/alphaMat_nd[2, 1]
    Func = gamma*temp+(1-gamma)*x
    return Func, cMat


def SteadyFuncTEIonic(x, gamma, cH):
    cMat[1, 2] = x[0]
    cMat[3, 2] = x[1]
    cH, muMat_nd, DMat_nd, SIGMA_nd, _, alphaMat_nd, pH, IonicStrength = \
        CalcSpatialProperties(IonicCalcFlag, IonicEffectFlag, cH, cMat, LCube, KaListCube, ValCube, zListArranged,
                              muCube, DCube, PolDeg, N, Nspecies, Kw, ref_values)  # calculate mobilities, conductivity at initial condition
    temp = np.zeros(2)
    temp[0] = cMat[1, 0]*(muMat_nd[1, 0]/muMat_nd[0, 0]-1) / \
        (muMat_nd[1, 2]/muMat_nd[3, 2]-1)
    Sigvec_new = muMat_nd[3, 2]/muMat_nd[0, 0]*SIGMA_nd[0, 0]
    Kw_new = Kw*10**(-2*getLogActivity(IonicStrength*IonicEffectFlag))
    temp[1] = (Sigvec_new-(alphaMat_nd[1, 2]*temp[0]+F*(muH*cH[0, 2]
               * met2lit+muOH*(Kw_new[0, 2]/cH[0, 2])*met2lit)))/alphaMat_nd[3, 2]
    Func = gamma*temp+(1-gamma)*x
    return Func, cMat


def FuncSteadyStateSolver(IonicCalcFlag, IonicEffectFlag, cH, cMat, LCube, KaListCube, ValCube, zListArranged, muCube, DCube, PolDeg, N, Nspecies, Kw, ref_values):
    cH, muMat_nd, DMat_nd, SIGMA_nd, _, _, pH, IonicStrength = \
        CalcSpatialProperties(IonicCalcFlag, IonicEffectFlag, cH, cMat, LCube, KaListCube, ValCube, zListArranged,
                              muCube, DCube, PolDeg, N, Nspecies, Kw, ref_values)  # calculate mobilities, conductivity at initial condition

    x = np.array([cMat[1, 0], cMat[0, 0]])
    # print(muMat_nd)
    # IonicCalcFlag=0
    # print((cH))
    Err = 500
    count = 0
    maxIter = 2000
    gamma = 0.9
    print("\nIterations for analyte zone")
    while (Err > 1.0e-10):
        count += 1
        x_old = x
        x, cMat = SteadyFuncAnalyteIonic(x, gamma, cH)
        Err = np.linalg.norm((x-x_old))
        # print(x)
        if count % 10 == 1:
            print ("Iteration = %d, Err=%g" % (count, Err))

            # break
        if count > maxIter:
            break
    # print('Iteration = %g, Err=%g \n', count, Err)
    cH, muMat_nd, DMat_nd, SIGMA_nd, _, _, pH, IonicStrength = \
        CalcSpatialProperties(IonicCalcFlag, IonicEffectFlag, cH, cMat, LCube, KaListCube, ValCube, zListArranged,
                              muCube, DCube, PolDeg, N, Nspecies, Kw, ref_values)  # calculate mobilities, conductivity at initial condition
    # print(muMat_nd)
    Res = np.zeros(4)
    Res[0] = 1-cMat[1, 0]*(muMat_nd[1, 0]/muMat_nd[0, 0]-1) / \
        (muMat_nd[1, 1]/muMat_nd[2, 1]-1)/cMat[1, 1]
    Res[1] = 1-(muMat_nd[2, 1]/muMat_nd[0, 0])*(SIGMA_nd[0, 0]/SIGMA_nd[0, 1])

    x = np.array([cMat[1, 1], cMat[2, 1]])
    Err = 500
    count = 0
    maxIter = 2000
    gamma = 0.9
    print("\nIterations for adjusted TE zone")
    while (Err > 1.0e-10):
        count += 1
        x_old = x
        x, cMat = SteadyFuncTEIonic(x, gamma, cH)
        Err = np.linalg.norm((x-x_old))
        if count % 10 == 1:
            print ("Iteration = %d, Err=%g" % (count, Err))
        if count > maxIter:
            break
    # print('Iteration = %g, Err=%g \n', count, Err)

    cH, muMat_nd, DMat_nd, SIGMA_nd, _, _, pH, IonicStrength = \
        CalcSpatialProperties(IonicCalcFlag, IonicEffectFlag, cH, cMat, LCube, KaListCube, ValCube, zListArranged,muCube, DCube, PolDeg, N, Nspecies, Kw, ref_values)
    # # print(muMat_nd)
    Res[2] = 1-cMat[1, 0]*(muMat_nd[1, 0]/muMat_nd[0, 0]-1) / \
        (muMat_nd[1, 2]/muMat_nd[3, 2]-1)/cMat[1, 2]
    Res[3] = 1-(muMat_nd[3, 2]/muMat_nd[0, 0])*(SIGMA_nd[0, 0]/SIGMA_nd[0, 2])
    return cMat, Res, muMat_nd, SIGMA_nd, pH, cH


def save_data(cMat, cMat_init, cH, Sigma, pH, muMat):
    # Save data in output file.
    file_name = './output/output_' +\
        (input_file.split('/')[-1]).split('.')[0] + '_'+str(N) + '.npz'

    np.savez_compressed(file_name, cMat_init, cMat, cH, Sigma, pH, muMat)
    print("data saved in file ", file_name)







# 
t_start = time()
# input_file =sys.argv[1]
# print("Input file :- ", input_file)

cMat, cMat_init, muCube, DCube, ValCube, LCube, KaListCube, PolDeg, zListArranged, ref_values, species, N, Nspecies, Kw, cH = InitialConditions()  # Initialize the system using the input file

IonicCalcFlag = 0
IonicEffectFlag = 0

cMat, Res, muMat, Sigma, pH, cH = FuncSteadyStateSolver(
    IonicCalcFlag, IonicEffectFlag, cH, cMat, LCube, KaListCube, ValCube, zListArranged, muCube, DCube, PolDeg, N, Nspecies, Kw, ref_values)

print('\nResidue', Res)
print("\nComputed zone concentrations")
print(cMat)
print("\nComputed effective mobilities in various zones")
print(muMat)
#print(cH)
print('\npH in ITP zones',pH)
print('\nConducitivity in ITP zones',Sigma)

#print(-np.log10(cH))
mu_abs = abs(muMat)

print('\nCheck stability of zones using ITP focusing conditions')
Focus = 1 #initialise 
# df = pd.read_csv('Cationic_DataBase.csv', lineterminator='\n')
if (mu_abs[0, 0] > mu_abs[2, 0]) and (mu_abs[0, 0] > mu_abs[3, 0]):  # LE zone
    print('\nLE zone condition satisfied')
else:
	Focus=Focus*0
	print('LE zone condition not satisfied')    
if (mu_abs[0, 1] > mu_abs[2, 1]) and (mu_abs[2, 1] > mu_abs[3, 1]):  # Analyte zone
    print('\nAnalyte zone condition satisfied')
else:
	Focus=Focus*0
	print('Analyte zone condition not satisfied')
if (mu_abs[0, 2] > mu_abs[3, 2]) and (mu_abs[2, 2] > mu_abs[3, 2]):  # TE zone
    print('\nTE zone condition satisfied')
else:
	Focus=Focus*0
	print('\nTE zone condition not satisfied')

if Focus==1:
   print('\nStable ITP predicted')
else:
   print('\nNo ITP predicted')	

t_end = time()
print('\nTotal time taken for computation = ', t_end-t_start, 'seconds')

# save_data(cMat,cMat_init,cH,Sigma,pH,muMat)


# Array name: arr_0
# [[10.  0.  0.  0.]
#  [20. 20. 20. 20.]
#  [ 0.  1.  0.  0.]
#  [ 0.  0.  5.  5.]]
# ---
# Array name: arr_1
# [[10.          0.          0.          0.        ]
#  [20.         16.55455057 16.09768635 20.        ]
#  [ 0.          6.54073495  0.          0.        ]
#  [ 0.          0.          6.07720389  5.        ]]
# ---
# Array name: arr_2
# [[8.39658553e-09 4.86571984e-09 4.19887236e-09 2.53117053e-09]]
# ---
# Array name: arr_3
# [[0.10482622 0.03309658 0.02749259 0.02376679]]
# ---
# Array name: arr_4
# [[8.07589728 8.3128529  8.37686733 8.59667859]]
# ---
# Array name: arr_5
# [[-7.91000000e-08 -7.91000000e-08 -7.91000000e-08 -7.91000000e-08]
#  [ 1.47517443e-08  1.08246813e-08  9.83578892e-09  6.83425772e-09]
#  [-2.37406655e-08 -2.49740868e-08 -2.52215644e-08 -2.58624913e-08]
#  [-1.85693927e-08 -2.03662886e-08 -2.07454227e-08 -2.17584002e-08]]
# ---__________-----------


# Input file :-  sample_file.txt
# 1000.0 [[0.01  0.    0.    0.   ]
#  [0.02  0.02  0.02  0.02 ]
#  [0.    0.001 0.    0.   ]
#  [0.    0.    0.005 0.005]]
# [[1.00000000e+02 1.00000000e+00]
#  [1.00000000e+00 1.19124201e+08]
#  [6.30957344e-08 1.00000000e+00]
#  [3.16227766e-08 1.00000000e+00]] [[-7.91e-08  0.00e+00]
#  [ 0.00e+00  2.95e-08]
#  [-2.69e-08  0.00e+00]
#  [-2.35e-08  0.00e+00]] [[-1.  0.]
#  [ 0.  1.]
#  [-1.  0.]
#  [-1.  0.]] [[2.03083881e-09 2.03083881e-09]
#  [7.57392477e-10 7.57392477e-10]
#  [6.90639241e-10 6.90639241e-10]
#  [6.03346549e-10 6.03346549e-10]] [[1.00000000e+02 1.00000000e+00]
#  [1.00000000e+00 8.39459987e-09]
#  [6.30957344e-08 1.00000000e+00]
#  [3.16227766e-08 1.00000000e+00]] {0: array([-1,  0]), 1: array([0, 1]), 2: array([-1,  0]), 3: array([-1,  0])} 2

# Iterations for analyte zone
# Iteration = 1, Err=5.95583
# Iteration = 11, Err=4.35523e-05
# Iteration = 21, Err=3.9534e-10

# Iterations for adjusted TE zone
# Iteration = 1, Err=0.887018
# Iteration = 11, Err=4.55023e-05
# Iteration = 21, Err=2.35965e-09

# Residue [1.84430249e-12 3.17701421e-12 2.23032703e-12 3.84059451e-12]

# Computed zone concentrations
# [[10.          0.          0.          0.        ]
#  [20.         16.55455057 16.09768635 20.        ]
#  [ 0.          6.54073495  0.          0.        ]
#  [ 0.          0.          6.07720389  5.        ]]

# Computed effective mobilities in various zones
# [[-7.91000000e-08 -7.91000000e-08 -7.91000000e-08 -7.91000000e-08]
#  [ 1.47517443e-08  1.08246813e-08  9.83578892e-09  6.83425772e-09]
#  [-2.37406655e-08 -2.49740868e-08 -2.52215644e-08 -2.58624913e-08]
#  [-1.85693927e-08 -2.03662886e-08 -2.07454227e-08 -2.17584002e-08]]

# pH in ITP zones [[8.07589728 8.3128529  8.37686733 8.59667859]]

# Conducitivity in ITP zones [[0.10482622 0.03309658 0.02749259 0.02376679]]

# Check stability of zones using ITP focusing conditions

# LE zone condition satisfied

# Analyte zone condition satisfied

# TE zone condition satisfied

# Stable ITP predicted