import numpy as np
import json
import time
from scipy.optimize import minimize


def convert_keys_to_int(data):
    updated_data = {}
    for key_str, value in data.items():
        key_int = int(key_str)
        updated_data[key_int] = value
    return updated_data

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
    
    
def lambda_handler(event, context):
        species = convert_keys_to_int(event.get('species'))
        
        IonicEffectFlag, IonicCalcFlag = event.get('ionicEffect'), event.get('ionicEffect')
        
        point_mobility = event.get('point_mobility')
        
        point_c_LE = event.get('point_c_LE')
        
        requested_output = event.get('requested_output')

        met2lit = 1000.0
        N = 4
        Nspecies = len(species) 
        cMat_read = create_cMat(species)
    

    
        F = 96500.            # C / mol
        met2lit = 1000.0e0
        Rmu = 8.314e0
        Temperature = 298.0e0
        muH = 362e-9
        muOH = 205e-9
        visc = 1e-3  # Dynamic viscosity (water) (Pa s)
        
        
        def InitialConditions_updated(species, point_c_LE, point_mobility):
            """
        
            Returns:
                LMat, muMat, zMat, DMat, KaMat, zListArranged, MaxCol: arrays of physical input quantities
            """
        

            species[0]["concentration"] = [point_c_LE]
            cMat_read[0, 0] = point_c_LE
        
            species[2]["mobility"] = [point_mobility]
        
            cMat = cMat_read * met2lit  # Convert from mol/lit to mol/m^3
            cMat_init = np.copy(cMat)
            LMat, muMat, ValMat, KaMat, zListArranged, PolDeg = EquilibriumParameters(species)
        
            mu_max = abs(muMat).max()
            c_max = cMat.max()
        
            muCube = np.tile(np.reshape(muMat, (Nspecies, 1, PolDeg)), (1, N, 1))  # mobilities
            ValCube = np.tile(np.reshape(ValMat, (Nspecies, 1, PolDeg)), (1, N, 1))  # valence
            LCube = np.tile(np.reshape(LMat, (Nspecies, 1, PolDeg)), (1, N, 1))
        
            # Used in Newquilibrium function
            KaListCube = np.tile(np.reshape(KaMat, (Nspecies, 1, PolDeg)), (1, N, 1))
            Kw = 1.0e-14
            cH = 10.0 ** (-7.0) * np.ones((1, N))  # set initial [H+] = 0 in mol/litre
        
            ref_values = {
                "concentration": c_max,
                "mobility": mu_max,
                "conductivity": mu_max * c_max * F,
            }
            return (
                cMat,
                cMat_init,
                muCube,
                ValCube,
                LCube,
                KaListCube,
                PolDeg,
                zListArranged,
                ref_values,
                species,
                N,
                Nspecies,
                Kw,
                cH,
                IonicEffectFlag,
            )
        
        
        def EquilibriumParameters(species):
            """Calculates parameters for chemical equilibrium calculation
        
            Args:
                species (dic): input dictionary of species
        
            Returns:
                array: Parameters for the calculation of chemical equilibrium
            """
        
            MaxCol = 1
            for j in species:
                num_mobility = len(species[j]["mobility"])
                if num_mobility > MaxCol:
                    MaxCol = num_mobility
            MaxCol = MaxCol + 1
        
            Nspecies = len(species)
            LMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
            zMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
            muMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
            KaMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.
        
            zListArranged = {}
        
            for j in species:
                zList = np.array(species[j]["valence"], int)
                muList = np.array(species[j]["mobility"], float)
                KaList = 10.0 ** (-np.array(species[j]["pKa"], float))
        
                index = np.argsort(zList)  # sort all lists
                zList = zList[index]
                muList = muList[index]
                KaList = KaList[index]
        
                muList = np.concatenate((muList[zList < 0], [0.0], muList[zList > 0]), axis=0)
                KaList = np.concatenate((KaList[zList < 0], [1.0], KaList[zList > 0]), axis=0)
        
                # zList at end to avoid changing in zList
                zList = np.concatenate((zList[zList < 0], [0], zList[zList > 0]), axis=0)
        
                N_list = len(zList)
        
                zMat[j, 0:N_list] = zList
                muMat[j, 0:N_list] = muList
                KaMat[j, 0:N_list] = KaList
                zListArranged.update({j: zMat[j].astype(int)})
        
                nj = np.min(zList)
                pj = np.max(zList)
        
                for z in zList:
                    if z < 0:
                        LMat[j, z - nj] = np.prod(KaList[z - nj : -nj])
                    elif z > 0:
                        LMat[j, z - nj] = 1.0 / np.prod(KaList[-nj : z - nj + 1])
                    elif z == 0:
                        LMat[j, z - nj] = 1.0
        
            return LMat, muMat, zMat, KaMat, zListArranged, MaxCol
        
        
        def LzFunc(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw, approx_factor):
            """Equation for iterative solution of pH
        
            Args:
                cH (array): [H+] array
                LCube (array): L-function array
                cMat (array): Concentration array
                ValCube (array): Valence array
                PolDeg (array): 2
                N (int): Number of zones
                Nspecies (int): Number of species
                Kw (float): Water dissociation constant
                approx_factor (float): Approximation constant in the calculation of the equilibrium
        
            Returns:
                F: iteration value for the equilibrium calculation
            """
        
            cHPolMat = np.append(
                np.ones((1, N)),
                np.cumprod(np.dot(np.ones((PolDeg - 1, 1)), cH), axis=0),
                axis=0,
            )  # size = PolDeg x N
        
            # size = Nspecies x N x PolDeg
            cHCubePower = np.tile(np.array([np.transpose(cHPolMat)]), (Nspecies, 1, 1))
            # sum over z. size = Nspecies x N
            TempMat = np.sum(LCube * cHCubePower, axis=2)
            TempCube = np.tile(TempMat.reshape(Nspecies, N, 1), (1, 1, PolDeg))
        
            M1Cube = np.tile((cMat / TempMat).reshape(Nspecies, N, 1), (1, 1, PolDeg))
            cizCube = LCube * cHCubePower * M1Cube  # equation 5 in J. Chroma A
        
            Temp_z = np.sum((ValCube * LCube * cHCubePower), axis=2)
            Temp_z_Cube = np.tile(Temp_z.reshape(Nspecies, N, 1), (1, 1, PolDeg))
            RHS_den = np.sum(
                np.sum(
                    (
                        cizCube * ValCube**2.0
                        - approx_factor * cizCube * ValCube * Temp_z_Cube / TempCube
                    ),
                    axis=2,
                ),
                axis=0,
            )
        
            RHS_num = np.sum(np.sum((cizCube * ValCube), axis=2), axis=0)
            F_num = RHS_num + cH - Kw / cH
        
            F_den = RHS_den / cH + 1.0 + Kw / (cH**2)
            F = F_num / F_den
        
            return F
        
        
        def LzCalcEquilibrium(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw):
            """Function to calculate chemical equilibrium iteratively
        
            Args:
                cH (array): [H+] array
                LCube (array): L-function array
                cMat (array): Concentration array
                ValCube (array): Valence array
                PolDeg (array): 2
                N (int): Number of zones
                Nspecies (int): Number of species
                Kw (float): Water dissociation constant
        
            Returns:
                array: Physical quantities after equilibrium calculation
            """
        
            cMat = cMat / met2lit  # cMat=cMat/met2lit; convert from mole/m^3 to mole/litre
            cHPrev = np.ones((1, N))
            cH_back = np.copy(cH)
            count = 0
            while np.linalg.norm((cHPrev - cH) / np.max(np.append(cH, cHPrev))) > 1.0e-4:
                count = count + 1
                cHPrev = cH
                cH = cH - LzFunc(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw, 1.0)
        
            if np.min(cH) < 0.0:  # do slow but robust iterations if cH is -ve
                cHPrev = np.ones((1, N))
                cH = cH_back
                count = 0
                while np.linalg.norm((cHPrev - cH) / np.max(np.append(cH, cHPrev))) > 1.0e-4:
                    count = count + 1
                    cHPrev = cH
                    cH = cH - LzFunc(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw, 0.0)
        
            cHPolMat = np.append(
                np.ones((1, N)),
                np.cumprod(np.dot(np.ones((PolDeg - 1, 1)), cH), axis=0),
                axis=0,
            )  # size = PolDeg x N
        
            # size = Nspecies x N x PolDeg
            cHCubePower = np.tile(np.array([np.transpose(cHPolMat)]), (Nspecies, 1, 1))
        
            # sum over z. size = Nspecies x N
            TempMat = np.sum(LCube * cHCubePower, axis=2)
            TempCube = np.tile(TempMat.reshape(Nspecies, N, 1), (1, 1, PolDeg))
        
            # M1Cube is denominator of eqn 5
            M1Cube = np.tile((cMat / TempMat).reshape(Nspecies, N, 1), (1, 1, PolDeg))
            cizCube = LCube * cHCubePower * M1Cube  # equation 5 in J. Chroma A
            gizCube = LCube * cHCubePower / TempCube
        
            return cizCube, cH, cHCubePower, gizCube
        
        
        def Myheaviside(X):
            """Heaviside function
        
            Args:
                X (array): input array
        
            Returns:
                array: heaviside(X)
            """
        
            Y = np.zeros(len(X))
            Y[X > 0] = 1
            Y[X == 0] = "NaN"
            return Y
        
        
        def RecomputeEquilibrium(zListArranged, NewKaListCube, Nspecies, N, PolDeg):
            """
            function to calculate equillibrium again called in Onsager function
        
            Args:
                zListArranged (list): List of valences
                NewKaListCube (list): List of Kas
                Nspecies (int): Number of species
                N (int): Number of zones
                PolDeg (int): 2
        
            Returns:
                LCube: L array
            """
            LCube = np.zeros((Nspecies, N, PolDeg))
            for k in range(N):
                for j in range(Nspecies):
                    zList = zListArranged[j]
                    KaList_new = NewKaListCube[j, k, :]
                    nj = np.min(zList)
                    for z in zList:
                        if z < 0:
                            LCube[j, k, z - nj] = np.prod(KaList_new[z - nj : -nj])
                        elif z > 0:
                            LCube[j, k, z - nj] = 1 / np.prod(KaList_new[-nj : z - nj + 1])
                        elif z == 0:
                            LCube[j, k, z - nj] = 1.0
            return LCube
        
        
        def getLogActivity(IonicStrength):
            """Function to find pH based on IonicStrength
        
            Args:
                IonicStrength (array): Ionic strength array
        
            Returns:
                array: Helper array for pH calculation
            """
        
            y = -0.5085 * (
                np.sqrt(IonicStrength) / (1 + 1.5 * np.sqrt(IonicStrength))
                - 0.1 / 0.5085 * IonicStrength
            )
            return y
        
        
        def CalcSpatialProperties(
            IonicCalcFlag,
            IonicEffectFlag,
            cH,
            cMat_nd,
            LCube,
            KaListCube,
            ValCube,
            zListArranged,
            muCube_nd,
            PolDeg,
            N,
            Nspecies,
            Kw,
            ref_values,
        ):
            """Calculates spatial properties such as mobilitiy, diffusivity, conductivity
            based on concentrations
        
            Args:
                IonicCalcFlag (bool): 0
                IonicEffectFlag (bool): Calculate with or without ionic strength effects
                cH (array): [H+] array
                cMat_nd (array): Concentration array
                LCube (array): L-function array
                KaListCube (array): Ka array
                ValCube (array): Valence array
                zListArranged (array): Arranged charge array
                muCube_nd (array): Mobilities array
                PolDeg (int): 2
                N (int): Number of zones
                Nspecies (int): Number of species
                Kw (float): Water dissociation constant
                ref_values (array): ref values for non-dimensionalization
        
            Returns:
                array: Spatial properties in ITP
            """
        
            muCube_d = muCube_nd  # Dimensionalize(muCube_nd,'mobility',ref_values)
            cMat_d = cMat_nd  # cMat_nd*ref_values['concentration']
            cizCube, cH, cHCubePower, gizCube = LzCalcEquilibrium(
                cH, LCube, cMat_d, ValCube, PolDeg, N, Nspecies, Kw
            )
        
            cizCube, cH, cHCubePower, gizCube, IonicStrength, LCube = CalculateIonicEffects(
                IonicEffectFlag,
                N,
                Nspecies,
                PolDeg,
                cH,
                LCube,
                KaListCube,
                cMat_d,
                ValCube,
                zListArranged,
                cizCube,
                cHCubePower,
                Kw,
                gizCube,
            )
        
            # Calculate new effective mobility
            muIonicCube = OnsagerFuoss(
                IonicEffectFlag, ValCube, cizCube, muCube_d, Nspecies, N, PolDeg
            )
        
            ICube = np.tile(np.reshape(IonicStrength, (1, N, 1)), (Nspecies, 1, PolDeg))
        
            muMat_nd = np.sum(muIonicCube * gizCube, axis=2)
        
            Kw_new = Kw * 10 ** (-2 * getLogActivity(IonicStrength * IonicEffectFlag))
            muH_new = muH
            muOH_new = muOH
        
            alphaMat = F * np.sum(ValCube * muIonicCube * gizCube, axis=2)
            SigVec_d = np.sum(alphaMat * cMat_d, axis=0) + F * met2lit * (
                muH_new * cH + muOH_new * Kw_new / cH
            )
        
            SigVec_nd = SigVec_d
        
            alphaMat_nd = alphaMat
            if IonicEffectFlag == 1:
                pH = -np.log10(cH * 10 ** getLogActivity(IonicStrength))
            else:
                pH = -np.log10(cH)
            return cH, muMat_nd, SigVec_nd, alphaMat_nd, pH, IonicStrength
        
        
        def CalculateIonicEffects(
            IonicEffectFlag,
            N,
            Nspecies,
            PolDeg,
            cH,
            LCube,
            KaListCube,
            cMat_d,
            ValCube,
            zListArranged,
            cizCube,
            cHCubePower,
            Kw,
            gizCube,
        ):
            """Function to calculate Ionic Strength
        
            Args:
                IonicEffectFlag (bool): Calculate ionic strength effects or not
                N (int): Number of zones
                Nspecies (int): Number of species
                PolDeg (int): 2
                cH (array): [H+] array
                LCube (array): L-function array
                KaListCube (array): Ka array
                cMat_d (array): Concentration array
                ValCube (array): Valence array
                zListArranged (array): Arranged charge array
                cizCube (array): Concentration array per species
                cHCubePower (array): /
                Kw (float): Water dissociation constant
                gizCube (array): Activity array
        
            Returns:
                array: Calculated quantities with ionic strength effects
            """
        
            Kw_new = Kw * np.ones((1, N))
            if IonicEffectFlag == 0:
                IonicStrength = np.zeros((1, N))
        
            elif IonicEffectFlag == 1:
                convergence = False
                count = 0
                while not convergence:
                    if count > 40:
                        break
                    count = count + 1
                    cHPrev = cH
                    IonicStrength = 0.5 * (
                        np.sum(np.sum(ValCube**2 * cizCube, axis=2), axis=0)
                        + cH
                        + Kw_new / cH
                    )
        
                    pKaFactor = -getLogActivity(IonicStrength)
                    zListHeavy = {}
        
                    for i in range(Nspecies):
                        zListHeavy.update(
                            {i: zListArranged[i] - Myheaviside(zListArranged[i] - 0.1)}
                        )
        
                    NewKaListCube = np.zeros((Nspecies, N, PolDeg))
                    for k in range(N):
                        for i in range(Nspecies):
                            NewKaListCube[i, k, :] = KaListCube[i, k, :] * 10 ** (
                                -pKaFactor[0, k] * 2.0 * zListHeavy[i]
                            )
        
                    LCube = RecomputeEquilibrium(
                        zListArranged, NewKaListCube, Nspecies, N, PolDeg
                    )
                    Kw_new = Kw * 10 ** (2 * pKaFactor)
                    cizCube, cH, cHCubePower, gizCube = LzCalcEquilibrium(
                        cH, LCube, cMat_d, ValCube, PolDeg, N, Nspecies, Kw_new
                    )
                    if (
                        np.linalg.norm((cHPrev - cH) / np.max(np.append(abs(cH), abs(cHPrev))))
                        < 1e-6
                    ):
                        convergence = True
                        break
                IonicStrength = (
                    IonicEffectFlag
                    * 0.5
                    * (
                        np.sum(np.sum(ValCube**2 * cizCube, axis=2), axis=0)
                        + cH
                        + Kw_new / cH
                    )
                )
            return cizCube, cH, cHCubePower, gizCube, IonicStrength, LCube
        
        
        def OnsagerFuoss(IonicEffectFlag, ValCube, cizCube, muCube_d, Nspecies, N, PolDeg):
            """function to find the new effective mobility
        
            Args:
                IonicEffectFlag (bool): Calculate ionic strength effects or not
                ValCube (array): Valence array
                cizCube (array): Concentration array per species
                muCube_d (array): Mobility array
                Nspecies (int): Number of species
                N (int): Number of zones
                PolDeg (int): 2
        
            Returns:
                array: Mobility array with Onsager-Fuoss correction
            """
        
            muIonicCube = np.copy(muCube_d)
            if IonicEffectFlag == 0:
                pass  # return muIonicCube
        
            elif IonicEffectFlag == 1:
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
                mob = np.reshape(np.absolute(muCube_d[X[0], 0, X[1]] / F), (1, XLen))
                omega = mob / abs(z)
        
                mob_new = np.zeros((1, XLen))
                conc = np.zeros((1, XLen))  # concentrations
        
                II = np.eye(XLen, XLen)
        
                for k in range(N):
                    conc = cizCube[X[0], k, X[1]]
        
                    IonicStr = np.sum(conc * (z**2))
                    mu = np.reshape(conc * z**2 / IonicStr, (1, XLen))
        
                    # now make matrix h
                    h = np.zeros((XLen, XLen))
        
                    h = np.multiply(mu, omega) / np.add(
                        (omega), np.repeat(np.transpose(omega), XLen, axis=1)
                    )
        
                    d = np.sum(h, axis=1)
                    d1 = np.diag(d)
                    h = h + d1  # makes matrix h.. adds the delta_(i,j) terms
        
                    B = 2 * h - II
        
                    r = np.zeros((XLen, len(c)))
        
                    # check for absolute signs
                    r[:, 0:1] = np.transpose(
                        z
                        - np.sum(z * mu)
                        / np.sum(mu * np.absolute(z) / mob)
                        * (np.absolute(z) / mob)
                    )
        
                    for i in range(1, len(c)):
                        r[:, i] = np.dot(B, r[:, i - 1])
        
                    # factors computed in table 3, page 2755 of Onsager-Fuoss
                    factor = np.dot(c, np.transpose(r))
        
                    # Now compute the ionic strength dependence of mobility
                    mob_new = z * (
                        F * omega
                        - (0.78420 * F * z * factor * omega + 31.410e-9)
                        * np.sqrt(IonicStr / 2)
                        / (1 + 1.5 * np.sqrt(IonicStr / 2))
                    )
        
                    # Assemble matrix back
                    for i in range(XLen):
                        muIonicCube[X[0][i], k, X[1][i]] = mob_new[0, i]
            return muIonicCube
        
        
        def SteadyFuncAnalyteIonic(
            x,
            gamma,
            IonicCalcFlag,
            IonicEffectFlag,
            cH,
            cMat,
            LCube,
            KaListCube,
            ValCube,
            zListArranged,
            muCube,
            PolDeg,
            N,
            Nspecies,
            Kw,
            ref_values,
        ):
            """Iterative solver for physical quantities in the analyte
        
            Args:
                x (array): Modified concentrations
                gamma (array): activity
                IonicCalcFlag (bool): 0
                IonicEffectFlag (bool): calculate ionic strength effects or not
                cH (array): [H+] array
                cMat (array): Concentration array
                LCube (array): L-function array
                KaListCube (array): Ka array
                ValCube (array): Valence array
                zListArranged (array): Arranged charge array
                muCube (array): Mobilities array
                PolDeg (int): 2
                N (int): Number of zones
                Nspecies (int): Number of species
                Kw (float): Water dissociation constant
                ref_values (array): ref values for non-dimensionalization
        
            Returns:
                array:  Activity correction and concentrations after analyte iterations
            """
        
            cMat[1, 1] = x[0]
            cMat[2, 1] = x[1]
            (
                cH,
                muMat_nd,
                SIGMA_nd,
                alphaMat_nd,
                pH,
                IonicStrength,
            ) = CalcSpatialProperties(
                IonicCalcFlag,
                IonicEffectFlag,
                cH,
                cMat,
                LCube,
                KaListCube,
                ValCube,
                zListArranged,
                muCube,
                PolDeg,
                N,
                Nspecies,
                Kw,
                ref_values,
            )  # calculate mobilities, conductivity at initial condition
            temp = np.zeros(2)
        
            temp[0] = (
                cMat[1, 0]
                * (muMat_nd[1, 0] / muMat_nd[0, 0] - 1)
                / (muMat_nd[1, 1] / muMat_nd[2, 1] - 1)
            )
            Sigvec_new = muMat_nd[2, 1] / muMat_nd[0, 0] * SIGMA_nd[0, 0]
        
            Kw_new = Kw * 10 ** (-2 * getLogActivity(IonicStrength * IonicEffectFlag))
            temp[1] = (
                Sigvec_new
                - (
                    alphaMat_nd[1, 1] * temp[0]
                    + F
                    * (muH * cH[0, 1] * met2lit + muOH * (Kw_new[0, 1] / cH[0, 1]) * met2lit)
                )
            ) / alphaMat_nd[2, 1]
            Func = gamma * temp + (1 - gamma) * x
            return Func, cMat
        
        
        def SteadyFuncTEIonic(
            x,
            gamma,
            IonicCalcFlag,
            IonicEffectFlag,
            cH,
            cMat,
            LCube,
            KaListCube,
            ValCube,
            zListArranged,
            muCube,
            PolDeg,
            N,
            Nspecies,
            Kw,
            ref_values,
        ):
            """Computes steady state quantities for the TE
        
            Args:
                x (array): Modified concentrations
                gamma (array): activity
                IonicCalcFlag (bool): 0
                IonicEffectFlag (bool): calculate ionic strength effects or not
                cH (array): [H+] array
                cMat (array): Concentration array
                LCube (array): L-function array
                KaListCube (array): Ka array
                ValCube (array): Valence array
                zListArranged (array): Arranged charge array
                muCube (array): Mobilities array
                PolDeg (int): 2
                N (int): Number of zones
                Nspecies (int): Number of species
                Kw (float): Water dissociation constant
                ref_values (array): ref values for non-dimensionalization
        
            Returns:
                array: Activity correction and concentrations after TE iterations
            """
        
            cMat[1, 2] = x[0]
            cMat[3, 2] = x[1]
            (
                cH,
                muMat_nd,
                SIGMA_nd,
                alphaMat_nd,
                pH,
                IonicStrength,
            ) = CalcSpatialProperties(
                IonicCalcFlag,
                IonicEffectFlag,
                cH,
                cMat,
                LCube,
                KaListCube,
                ValCube,
                zListArranged,
                muCube,
                PolDeg,
                N,
                Nspecies,
                Kw,
                ref_values,
            )  # calculate mobilities, conductivity at initial condition
            temp = np.zeros(2)
            temp[0] = (
                cMat[1, 0]
                * (muMat_nd[1, 0] / muMat_nd[0, 0] - 1)
                / (muMat_nd[1, 2] / muMat_nd[3, 2] - 1)
            )
            Sigvec_new = muMat_nd[3, 2] / muMat_nd[0, 0] * SIGMA_nd[0, 0]
            Kw_new = Kw * 10 ** (-2 * getLogActivity(IonicStrength * IonicEffectFlag))
            temp[1] = (
                Sigvec_new
                - (
                    alphaMat_nd[1, 2] * temp[0]
                    + F
                    * (muH * cH[0, 2] * met2lit + muOH * (Kw_new[0, 2] / cH[0, 2]) * met2lit)
                )
            ) / alphaMat_nd[3, 2]
            Func = gamma * temp + (1 - gamma) * x
            return Func, cMat
        
        
        def FuncSteadyStateSolver(
            IonicCalcFlag,
            IonicEffectFlag,
            cH,
            cMat,
            LCube,
            KaListCube,
            ValCube,
            zListArranged,
            muCube,
            PolDeg,
            N,
            Nspecies,
            Kw,
            ref_values,
        ):
            """Iterative solver for ITP steady state
        
            Args:
                IonicCalcFlag (bool): 0
                IonicEffectFlag (bool): calculate ionic strength effects or not
                cH (array): [H+] array
                cMat (array): Concentration array
                LCube (array): L-function array
                KaListCube (array): Ka array
                ValCube (array): Valence array
                zListArranged (array): Arranged charge array
                muCube (array): Mobilities array
                PolDeg (int): 2
                N (int): Number of zones
                Nspecies (int): Number of species
                Kw (float): Water dissociation constant
                ref_values (array): ref values for non-dimensionalization
        
            Returns:
                array: Physical quantities in ITP
            """
        
            cH, muMat_nd, SIGMA_nd, _, pH, IonicStrength = CalcSpatialProperties(
                IonicCalcFlag,
                IonicEffectFlag,
                cH,
                cMat,
                LCube,
                KaListCube,
                ValCube,
                zListArranged,
                muCube,
                PolDeg,
                N,
                Nspecies,
                Kw,
                ref_values,
            )  # calculate mobilities, conductivity at initial condition
        
            x = np.array([cMat[1, 0], cMat[0, 0]])
            Err = 500
            count = 0
            maxIter = 2000
            gamma = 0.9
        
            while Err > 1.0e-10:
                count += 1
                x_old = x
                x, cMat = SteadyFuncAnalyteIonic(
                    x,
                    gamma,
                    IonicCalcFlag,
                    IonicEffectFlag,
                    cH,
                    cMat,
                    LCube,
                    KaListCube,
                    ValCube,
                    zListArranged,
                    muCube,
                    PolDeg,
                    N,
                    Nspecies,
                    Kw,
                    ref_values,
                )
                Err = np.linalg.norm((x - x_old))
        
                if count > maxIter:
                    break
        
            cH, muMat_nd, SIGMA_nd, _, pH, IonicStrength = CalcSpatialProperties(
                IonicCalcFlag,
                IonicEffectFlag,
                cH,
                cMat,
                LCube,
                KaListCube,
                ValCube,
                zListArranged,
                muCube,
                PolDeg,
                N,
                Nspecies,
                Kw,
                ref_values,
            )  # calculate mobilities, conductivity at initial condition
        
            Res = np.zeros(4)
            Res[0] = (
                1
                - cMat[1, 0]
                * (muMat_nd[1, 0] / muMat_nd[0, 0] - 1)
                / (muMat_nd[1, 1] / muMat_nd[2, 1] - 1)
                / cMat[1, 1]
            )
            Res[1] = 1 - (muMat_nd[2, 1] / muMat_nd[0, 0]) * (SIGMA_nd[0, 0] / SIGMA_nd[0, 1])
        
            x = np.array([cMat[1, 1], cMat[2, 1]])
            Err = 500
            count = 0
            maxIter = 2000
            gamma = 0.9
        
            while Err > 1.0e-10:
                count += 1
                x_old = x
                x, cMat = SteadyFuncTEIonic(
                    x,
                    gamma,
                    IonicCalcFlag,
                    IonicEffectFlag,
                    cH,
                    cMat,
                    LCube,
                    KaListCube,
                    ValCube,
                    zListArranged,
                    muCube,
                    PolDeg,
                    N,
                    Nspecies,
                    Kw,
                    ref_values,
                )
                Err = np.linalg.norm((x - x_old))
        
                if count > maxIter:
                    break
        
            cH, muMat_nd, SIGMA_nd, _, pH, IonicStrength = CalcSpatialProperties(
                IonicCalcFlag,
                IonicEffectFlag,
                cH,
                cMat,
                LCube,
                KaListCube,
                ValCube,
                zListArranged,
                muCube,
                PolDeg,
                N,
                Nspecies,
                Kw,
                ref_values,
            )
        
            Res[2] = (
                1
                - cMat[1, 0]
                * (muMat_nd[1, 0] / muMat_nd[0, 0] - 1)
                / (muMat_nd[1, 2] / muMat_nd[3, 2] - 1)
                / cMat[1, 2]
            )
            Res[3] = 1 - (muMat_nd[3, 2] / muMat_nd[0, 0]) * (SIGMA_nd[0, 0] / SIGMA_nd[0, 2])
            return cMat, Res, muMat_nd, SIGMA_nd, pH, cH
        
        
        def check_ITP_conditions(muMat):
            """
            Checks the ITP conditions
        
            Args:
                muMat (array): array of computed mobilities after FuncSteadySolver is executed
        
            Returns:
                bool: True if all ITP conditions are verified, False otherwise
            """
        
            mu_abs = abs(muMat)
            Focus = 1
        
            if (mu_abs[0, 0] > mu_abs[2, 0]) and (mu_abs[0, 0] > mu_abs[3, 0]):  # LE zone
                pass
            else:
                Focus = Focus * 0
            if (mu_abs[0, 1] > mu_abs[2, 1]) and (mu_abs[2, 1] > mu_abs[3, 1]):  # Analyte zone
                pass
            else:
                Focus = Focus * 0
            if (mu_abs[0, 2] > mu_abs[3, 2]) and (mu_abs[2, 2] > mu_abs[3, 2]):  # TE zone
                pass
            else:
                Focus = Focus * 0
            return Focus == 1
        
        
        def check_ITP_status(muMat):
            mu_abs = abs(muMat)
        
            Focus = 1
            if not (mu_abs[0, 0] > mu_abs[2, 0]) and (mu_abs[0, 0] > mu_abs[3, 0]):  # LE zone
                Focus = Focus * 0
                print("LE zone condition not satisfied")
            if not (mu_abs[0, 1] > mu_abs[2, 1]) and (
                mu_abs[2, 1] > mu_abs[3, 1]
            ):  # Analyte zone
                Focus = Focus * 0
                print("Analyte zone condition not satisfied")
            if not ((mu_abs[0, 2] > mu_abs[3, 2]) and (mu_abs[2, 2] > mu_abs[3, 2])):  # TE zone
                Focus = Focus * 0
                print("TE zone condition not satisfied")
            return Focus
        
        
        (
            cMat,
            cMat_init,
            muCube,
            ValCube,
            LCube,
            KaListCube,
            PolDeg,
            zListArranged,
            ref_values,
            species,
            N,
            Nspecies,
            Kw,
            cH,
            IonicCalcFlag,
        ) = InitialConditions_updated(species, point_c_LE, point_mobility)
        
        
        cMat, Res, muMat, Sigma, pH, cH = FuncSteadyStateSolver(
            IonicCalcFlag,
            IonicEffectFlag,
            cH,
            cMat,
            LCube,
            KaListCube,
            ValCube,
            zListArranged,
            muCube,
            PolDeg,
            N,
            Nspecies,
            Kw,
            ref_values,
        )
        
        # CHECK FOR ITP CONDITIONS
        Focus = check_ITP_status(muMat)
        if Focus == 1:
            print("\nStable ITP predicted")
        else:
            print("\nNo ITP predicted")
        
        # RETURN THE VALUE FOR THE HEATMAP
        print
        
        
        try:
            result = {
                "sample_mobility_ratio": muMat[2, 2] / muMat[3, 2],
                "sample_pre_concentration": cMat[2, 1] / cMat_init[2, 1],
                "itpCheck": Focus == 1,
                "input": {'point_mobility': point_mobility, 'point_c_LE':point_c_LE }
            }

            return {
                'statusCode': 200,
                'body': json.dumps(result)
            }

        except Exception as e:
            # If an error occurs, return error response
            return {
                "statusCode": 500,
                "body": "Error: " + str(e),
                "headers": {
                    "Content-Type": "text/plain"
                }
            }