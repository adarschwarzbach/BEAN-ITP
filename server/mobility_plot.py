import numpy as np
import json

F = 96500.0e0  # C / mol
met2lit = 1000.0e0
Rmu = 8.314e0
Temperature = 298.0e0
muH = 362e-9
muOH = 205e-9
visc = 1e-3  # Dynamic viscosity (water) (Pa s)

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
                    LCube[j, k, z - nj] = np.prod(KaList_new[z - nj : -nj])
                elif z > 0:
                    LCube[j, k, z - nj] = 1 / np.prod(KaList_new[-nj : z - nj + 1])
                elif z == 0:
                    LCube[j, k, z - nj] = 1.0
    return LCube
def Myheaviside(X):
        Y = np.zeros(len(X))
        Y[X > 0] = 1
        Y[X == 0] = "NaN"
        return Y
        
def pitts_correction(inf_dil_mobility, CI_inf_dil_mobility, val, CI_val, ionic_strength, radius=4.0):
    q = (
        np.abs(val * CI_val)
        * (inf_dil_mobility + CI_inf_dil_mobility)
        / (
            (np.abs(val) + np.abs(CI_val))
            * (np.abs(val) * inf_dil_mobility + np.abs(CI_val) * CI_inf_dil_mobility)
        )
    )
    mult = np.sqrt(ionic_strength) / (1 + 0.33 * radius * np.sqrt(ionic_strength))
    parens = (
        3.1e-4 * val
        + 0.39
        * np.abs(val)
        * np.abs(CI_val)
        * 2
        * (abs(q))
        / (1 + np.sqrt(abs(q)))
        * inf_dil_mobility
    )
    return inf_dil_mobility - parens * mult


def davies_correction(pKa, valence, ionic_strength):
    return (
        pKa
        - log_coef_davies(valence + 1, ionic_strength)
        + log_coef_davies(1, ionic_strength)
        + log_coef_davies(valence, ionic_strength)
    )


def log_coef_davies(valence, ionic_strength):
    return (
        -0.5102
        * (valence**2)
        * ionic_strength
        / (1 + 1.5 * np.sqrt(2) * ionic_strength)
        + 0.1 * valence**2 * ionic_strength
    )


def calc_mobility(valences, abs_mobilities, Kas, pH):
    mob = 0
    for i, z in enumerate(valences):
        mob += abs_mobilities[i] * calc_gX(z, valences, Kas, pH)
    return mob


def calc_gX(z, valences, Kas, pH):
    cH = 10**-pH
    num = calc_LX(z, valences, Kas) * (cH**z)
    den = 0
    for val in valences:
        den += calc_LX(val, valences, Kas) * (cH**val)
    return num / den


def calc_LX(z, valences, Kas):
    Lx = 1
    start_index = valences.index(z)
    if z < 0:
        j = 0
        while start_index + j < len(valences) and valences[start_index + j] <= -1:
            Lx = Lx * Kas[start_index + j]
            j += 1
    elif z > 0:
        j = 1
        while start_index - j >= 0 and valences[start_index - j] >= 0:
            Lx = Lx / Kas[start_index - j]
            j += 1
    return Lx


def filter_val_list(input_list, sign):
    out = []
    for el in input_list:
        if np.sign(el) == sign:
            out.append(el)
    return out


def flatten(xss):
    out = []
    for xs in xss:
        if type(xs) == int:
            out.append(xs)
        elif len(xs) == 1:
            out.append(xs)
        else:
            for l in range(len(xs)):
                out.append(xs[l])
    return out


def wrap_val_and_mob(val, mob):
    if len(val) == 1:
        if val[0] > 0:
            spec_val = [val[0] - 1, val[0]]
        else:
            spec_val = [val[0], val[0] + 1]
    else:
        if 0 in val:
            spec_val = val
        elif max(val) * min(val) < 0:
            spec_val = flatten([filter_val_list(val, -1), 0, filter_val_list(val, 1)])
        elif max(val) < 0:
            spec_val = val + [max(val) + 1]
        else:
            spec_val = [min(val) - 1] + val

    if len(mob) == 1:
        if val[0] > 0:
            spec_mob = [0, mob[0]]
        else:
            spec_mob = [mob[0], 0]
    else:
        if 0 in val:
            spec_mob = mob
        elif max(val) * min(val) < 0:
            spec_mob = flatten(
                [filter_val_list(mob, -1), 0, filter_val_list(mob, 1)][:]
            )
        elif max(val) < 0:
            spec_mob = mob + [0]
        else:
            spec_mob = [0] + mob
    return spec_val, spec_mob


def create_mobility_plots(valences, pKa, mobilities, Npoints=500, ionic_effect_flag=False, ionic_strength=0):
    lin_pH = np.linspace(2, 12, Npoints)
    sol = np.zeros((len(valences), Npoints))
    Nspecies = len(valences)

    for n, pH_ref in enumerate(lin_pH):
        for i in range(Nspecies):
            spec_val, spec_mob = wrap_val_and_mob(valences[i], mobilities[i])
            mob_for_calc = np.zeros(len(spec_mob))
            pKa_for_calc = np.zeros(len(pKa[i]))

            for j, val in enumerate(spec_val):
                if ionic_effect_flag:
                    if i != 1:
                        mob_for_calc[j] = (
                            pitts_correction(
                                spec_mob[j] * 1e4,
                                mobilities[1][0] * 1e4,
                                val,
                                valences[1][0],
                                ionic_strength,
                            )
                            * 1e-4
                        )
                    else:
                        mob_for_calc[j] = (
                            pitts_correction(
                                spec_mob[j] * 1e4,
                                mobilities[3][0] * 1e4,
                                val,
                                valences[3][0],
                                ionic_strength,
                            )
                            * 1e-4
                        )
                else:
                    mob_for_calc[j] = spec_mob[j]

            for j in range(len(pKa[i])):
                if ionic_effect_flag:
                    pKa_for_calc[j] = davies_correction(
                        pKa[i][j], spec_val[j], ionic_strength
                    )
                else:
                    pKa_for_calc[j] = pKa[i][j]

            sol[i, n] = calc_mobility(
                spec_val, mob_for_calc, 10 ** (-np.array(pKa_for_calc)), pH_ref
            )

    return lin_pH, sol


def InitialConditions(labels, valences, mobilities, pKa, concentrations, ionic_strength_flag=False):
    N = 4
    IonicEffectFlag = ionic_strength_flag

    species = {
        0: {
            "Name": labels[0],
            "valence": valences[0],
            "mobility": mobilities[0],
            "pKa": pKa[0],
            "concentration": concentrations[0],
            "type": "LE",
        },
        1: {
            "Name": labels[1],
            "valence": valences[1],
            "mobility": mobilities[1],
            "pKa": pKa[1],
            "concentration": concentrations[1],
            "type": "Background",
        },
        2: {
            "Name": labels[2],
            "valence": valences[2],
            "mobility": mobilities[2],
            "pKa": pKa[2],
            "concentration": concentrations[2],
            "type": "Analyte",
        },
        3: {
            "Name": labels[3],
            "valence": valences[3],
            "mobility": mobilities[3],
            "pKa": pKa[3],
            "concentration": concentrations[3],
            "type": "TE",
        },
    }

    Nspecies = len(species)
    cMat_read = np.zeros((Nspecies, N))  # initialize cMat to zero
    cMat_read[0, 0] = species[0]["concentration"]
    cMat_read[1, :] = species[1]["concentration"]
    cMat_read[2, 1] = species[2]["concentration"]
    cMat_read[3, 2:] = species[3]["concentration"]

    cMat = cMat_read * met2lit  # Convert from mol/lit to mol/m^3
    cMat_init = np.copy(cMat)
    LMat, muMat, ValMat, DMat, KaMat, zListArranged, PolDeg = EquilibriumParameters(species)

    mu_max = abs(muMat).max()
    D_max = DMat.max()
    c_max = cMat.max()

    muCube = np.tile(np.reshape(muMat, (Nspecies, 1, PolDeg)), (1, N, 1))  # mobilities
    DCube = np.tile(np.reshape(DMat, (Nspecies, 1, PolDeg)), (1, N, 1))  # diffusivities
    ValCube = np.tile(np.reshape(ValMat, (Nspecies, 1, PolDeg)), (1, N, 1))  # valence
    LCube = np.tile(np.reshape(LMat, (Nspecies, 1, PolDeg)), (1, N, 1))

    # Used in Newquillibirium function
    KaListCube = np.tile(np.reshape(KaMat, (Nspecies, 1, PolDeg)), (1, N, 1))
    Kw = 1.0e-14
    cH = 10.0 ** (-7.0) * np.ones((1, N))  # set initial [H+] = 0 in mol/litre

    ref_values = {
        "concentration": c_max,
        "mobility": mu_max,
        "diffusivity": D_max,
        "conductivity": mu_max * c_max * F,
        "diffusive_current": D_max * c_max * F,
    }

    return (
        cMat,
        cMat_init,
        muCube,
        DCube,
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
        ionic_strength_flag,
    )


def EquilibriumParameters(species):
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
    DMat = np.zeros((Nspecies, MaxCol))  # initialize to zero.

    zListArranged = {}

    for j in species:
        zList = np.array(species[j]["valence"], int)
        muList = np.array(species[j]["mobility"], float)
        KaList = 10.0 ** (-np.array(species[j]["pKa"], float))
        DList = Rmu * Temperature * muList / (F * zList)  # diffusivity

        index = np.argsort(zList)  # sort all lists
        zList = zList[index]
        muList = muList[index]
        KaList = KaList[index]
        DList = DList[index]

        muList = np.concatenate((muList[zList < 0], [0.0], muList[zList > 0]), axis=0)
        KaList = np.concatenate((KaList[zList < 0], [1.0], KaList[zList > 0]), axis=0)
        DList = np.concatenate(
            (DList[zList < 0], [np.mean(DList)], DList[zList > 0]), axis=0
        )
        # zList at end to avoid changing in zList
        zList = np.concatenate((zList[zList < 0], [0], zList[zList > 0]), axis=0)

        N_list = len(zList)

        zMat[j, 0:N_list] = zList
        muMat[j, 0:N_list] = muList
        KaMat[j, 0:N_list] = KaList
        DMat[j, 0:N_list] = DList
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

    return LMat, muMat, zMat, DMat, KaMat, zListArranged, MaxCol


def LzCalcEquilibrium(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw):
    cMat = cMat / met2lit  # cMat=cMat/met2lit; convert from mole/m^3 to mole/litre
    cHPrev = np.ones((1, N))
    cH_back = np.copy(cH)
    count = 0
    while np.linalg.norm((cHPrev - cH) / np.max(np.append(cH, cHPrev))) > 1.0e-6:
        count = count + 1
        cHPrev = cH
        cH = cH - LzFunc(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw, 1.0)

    if np.min(cH) < 0.0:  # do slow but robust iterations if cH is -ve
        cHPrev = np.ones((1, N))
        cH = cH_back
        count = 0
        while np.linalg.norm((cHPrev - cH) / np.max(np.append(cH, cHPrev))) > 1.0e-6:
            count = count + 1
            cHPrev = cH
            cH = cH - LzFunc(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw, 0.0)

    cHPolMat = np.append(
        np.ones((1, N)),
        np.cumprod(np.dot(np.ones((PolDeg - 1, 1)), cH), axis=0),
        axis=0,
    )  # size = PolDeg x N
    cHCubePower = np.tile(np.array([np.transpose(cHPolMat)]), (Nspecies, 1, 1))
    TempMat = np.sum(LCube * cHCubePower, axis=2)
    TempCube = np.tile(TempMat.reshape(Nspecies, N, 1), (1, 1, PolDeg))

    M1Cube = np.tile((cMat / TempMat).reshape(Nspecies, N, 1), (1, 1, PolDeg))
    cizCube = LCube * cHCubePower * M1Cube  # equation 5 in J. Chroma A
    gizCube = LCube * cHCubePower / TempCube

    return cizCube, cH, cHCubePower, gizCube


def LzFunc(cH, LCube, cMat, ValCube, PolDeg, N, Nspecies, Kw, approx_factor):
    cHPolMat = np.append(
        np.ones((1, N)),
        np.cumprod(np.dot(np.ones((PolDeg - 1, 1)), cH), axis=0),
        axis=0,
    )  # size = PolDeg x N
    cHCubePower = np.tile(np.array([np.transpose(cHPolMat)]), (Nspecies, 1, 1))
    TempMat = np.sum(LCube * cHCubePower, axis=2)
    TempCube = np.tile(TempMat.reshape(Nspecies, N, 1), (1, 1, PolDeg))
    M1Cube = np.tile((cMat / TempMat).reshape(Nspecies, N, 1), (1, 1, PolDeg))
    cizCube = LCube * cHCubePower * M1Cube  # equation 5 in J. Chroma A
    gizCube = LCube * cHCubePower / TempCube

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


def getLogActivity(IonicStrength):
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
    DCube_nd,
    PolDeg,
    N,
    Nspecies,
    Kw,
    ref_values,
):
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
    muIonicCube = OnsagerFuoss(
        IonicEffectFlag, ValCube, cizCube, muCube_d, Nspecies, N, PolDeg
    )

    ICube = np.tile(np.reshape(IonicStrength, (1, N, 1)), (Nspecies, 1, PolDeg))

    muMat_nd = np.sum(muIonicCube * gizCube, axis=2)
    DTemp = DCube_nd * (1 - 0.2297 * np.sqrt(ICube))

    DMat_nd = np.sum(DTemp * gizCube, axis=2)
    Kw_new = Kw * 10 ** (-2 * getLogActivity(IonicStrength * IonicEffectFlag))
    muH_new = muH
    muOH_new = muOH

    alphaMat = F * np.sum(ValCube * muIonicCube * gizCube, axis=2)
    betaMat = F * np.sum(ValCube * DTemp * gizCube, axis=2)
    SigVec_d = np.sum(alphaMat * cMat_d, axis=0) + F * met2lit * (
        muH_new * cH + muOH_new * Kw_new / cH
    )
    SVec_d = np.sum(betaMat * cMat_d, axis=0) + F * (
        Rmu * Temperature / F
    ) * met2lit * (muH_new * cH - muOH_new * Kw_new / cH)

    SigVec_nd = SigVec_d
    SVec_nd = SVec_d
    alphaMat_nd = alphaMat
    if IonicEffectFlag == 1:
        pH = -np.log10(cH * 10 ** getLogActivity(IonicStrength))
    else:
        pH = -np.log10(cH)
    return cH, muMat_nd, DMat_nd, SigVec_nd, SVec_nd, alphaMat_nd, pH, IonicStrength


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
    Kw_new = Kw * np.ones((1, N))
    if IonicEffectFlag == 0:
        IonicStrength = np.zeros((1, N))
    elif IonicEffectFlag == 1:
        convergence = False
        count = 0
        while not convergence:
            if count > 40:
                print("no convergence in Ionic Effects")
                break
            count = count + 1
            cHPrev = cH
            IonicStrength = 0.5 * (
                np.sum(np.sum(ValCube**2 * cizCube, axis=2), axis=0) + cH + Kw_new / cH
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
            * (np.sum(np.sum(ValCube**2 * cizCube, axis=2), axis=0) + cH + Kw_new / cH)
        )
    return cizCube, cH, cHCubePower, gizCube, IonicStrength, LCube


def OnsagerFuoss(IonicEffectFlag, ValCube, cizCube, muCube_d, Nspecies, N, PolDeg):
    muIonicCube = np.copy(muCube_d)
    if IonicEffectFlag == 0:
        pass  # return muIonicCube
    elif IonicEffectFlag == 1:
        X = np.nonzero(ValCube[:, 0, :])
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
            h = np.zeros((XLen, XLen))
            h = np.multiply(mu, omega) / np.add(
                (omega), np.repeat(np.transpose(omega), XLen, axis=1)
            )
            d = np.sum(h, axis=1)
            d1 = np.diag(d)
            h = h + d1  # makes matrix h.. adds the delta_(i,j) terms
            B = 2 * h - II
            r = np.zeros((XLen, len(c)))
            r[:, 0:1] = np.transpose(
                z
                - np.sum(z * mu)
                / np.sum(mu * np.absolute(z) / mob)
                * (np.absolute(z) / mob)
            )
            for i in range(1, len(c)):
                r[:, i] = np.dot(B, r[:, i - 1])
            factor = np.dot(c, np.transpose(r))
            mob_new = z * (
                F * omega
                - (0.78420 * F * z * factor * omega + 31.410e-9)
                * np.sqrt(IonicStr / 2)
                / (1 + 1.5 * np.sqrt(IonicStr / 2))
            )
            for i in range(XLen):
                muIonicCube[X[0][i], k, X[1][i]] = mob_new[0, i]
    return muIonicCube


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
    DCube,
    PolDeg,
    N,
    Nspecies,
    Kw,
    ref_values,
):
    cH, muMat_nd, DMat_nd, SIGMA_nd, _, _, pH, IonicStrength = CalcSpatialProperties(
        IonicCalcFlag,
        IonicEffectFlag,
        cH,
        cMat,
        LCube,
        KaListCube,
        ValCube,
        zListArranged,
        muCube,
        DCube,
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
    
        
    def SteadyFuncAnalyteIonic(x, gamma, cH, cMat, IonicCalcFlag, IonicEffectFlag):
        cMat[1, 1] = x[0]
        cMat[2, 1] = x[1]
        cH, muMat_nd, DMat_nd, SIGMA_nd, _, alphaMat_nd, pH, IonicStrength = (
            CalcSpatialProperties(
                IonicCalcFlag,
                IonicEffectFlag,
                cH,
                cMat,
                LCube,
                KaListCube,
                ValCube,
                zListArranged,
                muCube,
                DCube,
                PolDeg,
                N,
                Nspecies,
                Kw,
                ref_values,
            )
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
    
    
    def SteadyFuncTEIonic(x, gamma, cH, cMat, IonicCalcFlag, IonicEffectFlag):
        cMat[1, 2] = x[0]
        cMat[3, 2] = x[1]
        cH, muMat_nd, DMat_nd, SIGMA_nd, _, alphaMat_nd, pH, IonicStrength = (
            CalcSpatialProperties(
                IonicCalcFlag,
                IonicEffectFlag,
                cH,
                cMat,
                LCube,
                KaListCube,
                ValCube,
                zListArranged,
                muCube,
                DCube,
                PolDeg,
                N,
                Nspecies,
                Kw,
                ref_values,
            )
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
    
    
    def Myheaviside(X):
        Y = np.zeros(len(X))
        Y[X > 0] = 1
        Y[X == 0] = "NaN"
        return Y
    
    
    def RecomputeEquilibrium(zListArranged, NewKaListCube, Nspecies, N, PolDeg):
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
    

    while Err > 1.0e-10:
        count += 1
        x_old = x
        x, cMat = SteadyFuncAnalyteIonic(x, gamma, cH, cMat, IonicCalcFlag, IonicEffectFlag)
        Err = np.linalg.norm((x - x_old))
        if count > maxIter:
            break

    cH, muMat_nd, DMat_nd, SIGMA_nd, _, _, pH, IonicStrength = CalcSpatialProperties(
        IonicCalcFlag,
        IonicEffectFlag,
        cH,
        cMat,
        LCube,
        KaListCube,
        ValCube,
        zListArranged,
        muCube,
        DCube,
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
        x, cMat = SteadyFuncTEIonic(x, gamma, cH, cMat, IonicCalcFlag, IonicEffectFlag)
        Err = np.linalg.norm((x - x_old))
        if count > maxIter:
            break

    cH, muMat_nd, DMat_nd, SIGMA_nd, _, _, pH, IonicStrength = CalcSpatialProperties(
        IonicCalcFlag,
        IonicEffectFlag,
        cH,
        cMat,
        LCube,
        KaListCube,
        ValCube,
        zListArranged,
        muCube,
        DCube,
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



def lambda_handler(event, context):
    # Convert concentrations 2D array elements to float
    concentrations = np.array(event.get('concentrations'), dtype=float)
    
    # Convert valences 2D array elements to float
    valences = event.get('valences')
    valences = [[float(val) for val in sublist] for sublist in valences]
    
    # Convert pKa 2D array elements to float
    pKa = event.get('pKa')
    pKa = [[float(x) for x in sublist] for sublist in pKa]
    
    # Convert mobilities 2D array elements to float
    mobilities = event.get('mobilities')
    mobilities = [[float(x) for x in sublist] for sublist in mobilities]
    
    labels = event.get('labels')

    Npoints = 500

    lin_pH, sol1 = create_mobility_plots(valences, pKa, mobilities, Npoints, ionic_effect_flag=False)
    ionic_strength_flag = True

    (
        cMat,
        cMat_init,
        muCube,
        DCube,
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
    ) = InitialConditions(
        labels, valences, mobilities, pKa, concentrations, ionic_strength_flag
    )

    IonicCalcFlag = 0
    cMat, Res, muMat, Sigma, pH, cH = FuncSteadyStateSolver(
        IonicCalcFlag,
        ionic_strength_flag,
        cH,
        cMat,
        LCube,
        KaListCube,
        ValCube,
        zListArranged,
        muCube,
        DCube,
        PolDeg,
        N,
        Nspecies,
        Kw,
        ref_values,
    )
    ATE_concentrations = cMat[:, 2]
    LE_concentrations = cMat[:, 0]

    ionic_strength_ATE = 0
    ionic_strength_LE = 0

    for i, conc in enumerate(ATE_concentrations):
        for j, val in enumerate(valences[i]):
            ex_val, ex_mob = wrap_val_and_mob(valences[i], mobilities[i])
            ionic_strength_ATE += (
                1
                / 2
                * val**2
                * calc_gX(val, ex_val, 10 ** (-np.array(pKa[i])), pH[0, 2])
                * conc
            ) * 1e-3

            ionic_strength_LE += (
                1
                / 2
                * val**2
                * calc_gX(val, ex_val, 10 ** (-np.array(pKa[i])), pH[0, 0])
                * LE_concentrations[i]
            ) * 1e-3

    lin_pH, sol2a = create_mobility_plots(
        valences, pKa, mobilities, Npoints, True, ionic_strength_ATE
    )

    lin_pH, sol2b = create_mobility_plots(
        valences, pKa, mobilities, Npoints, True, ionic_strength_LE
    )

    sol2 = np.zeros(sol2a.shape)
    for p, pH in enumerate(lin_pH):
        sol2[0, p] = sol2b[0, p]
        sol2[1:, p] = sol2a[1:, p]

    response = {
        "lin_pH": lin_pH.tolist(),
        "sol1": sol1.tolist(),
        "sol2": sol2.tolist()
    }

    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }

