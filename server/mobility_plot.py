## Mobility plots for BEAN-ITP ##

import numpy as np

# Optional imports and plotting settings for the example case below
import matplotlib.pyplot as plt
import matplotlib

plt.rcParams["axes.spines.right"] = False
plt.rcParams["axes.spines.top"] = False
plt.rcParams["font.sans-serif"] = "Helvetica"
plt.rcParams["mathtext.fontset"] = "custom"
plt.rcParams["font.family"] = "sans-serif"
matplotlib.rcParams.update({"font.size": 16})
plt.rcParams["figure.dpi"] = 100
cmap = plt.get_cmap("viridis")


# Helper functions
def calc_mobility(valences, abs_mobilities, Kas, pH):
    """Computes effective mobilities (see eq. 4 from Persat II 2009).
    Valences, absolute mobilities, and Kas must be in ascending order.

    Args:
        valences (array): array of valences of the species in solution
        abs_mobilities (array): array of mobilities of the species in solution
        Kas (array): array of Kas of the species in solution
        pH (float): pH of interest for the calculation

    Returns:
        float: Effective mobilities at the given pH
    """
    mob = 0
    for i, z in enumerate(valences):
        mob += abs_mobilities[i] * calc_gX(z, valences, Kas, pH)
    return mob


def calc_gX(z, valences, Kas, pH):
    """Computes gX,z (see eq. 3 from Persat II 2009).
    Valences, absolute mobilities, and Kas must be in ascending order.

    Args:
        z (array): Valences of interest
        valences (array): _description_
        Kas (array): array of Kas of the species in solution
        pH (float): pH of interest for the calculation

    Returns:
        float: gX,z
    """
    cH = 10**-pH

    num = calc_LX(z, valences, Kas) * (cH**z)

    den = 0
    for val in valences:
        den += calc_LX(val, valences, Kas) * (cH**val)

    return num / den


def calc_LX(z, valences, Kas):
    """Computes LX (see eq. 15 from Persat I 2009).
    Valences, absolute mobilities, and Kas must be in ascending order.

    Args:
        z (array): Valences of interest
        valences (array): _description_
        Kas (array): array of Kas of the species in solution

    Returns:
        float: LX
    """
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


def wrap_val_and_mob(val, mob):
    """Formats valences and mobilities from input to usable arrays for IS calculation

    Args:
        val (list): List of valences
        mob (list): List of mobilities

    Returns:
        list: List of valences formatted for further calculations
        list: List of mobilities formatted for further calculations
    """
    if len(val) == 1:
        if val > 0:
            spec_val = [val - 1, val]
        else:
            spec_val = [val, val + 1]
    else:
        if max(val) < 0:
            spec_val = np.append(val, max(val) + 1)
        else:
            spec_val = np.append(min(val) - 1, val)

    if len(mob) == 1:
        if val > 0:
            spec_mob = np.array([0, mob[0]])
        else:
            spec_mob = np.array([mob[0], 0])
    else:
        if max(val) < 0:
            spec_mob = np.append(spec_mob, 0)
        else:
            spec_mob = np.append(0, spec_mob)
    return spec_val, spec_mob


def compute_mobility_IS(mobilities, valences, concentrations):
    """Computes the modified mobility taking into account ionic strength effects.
    Refs: Bahga 2010 and Onsager-Fuoss 1932 (p.2751-2755).

    Args:
        mobilities (list): list of the mobilities at infinite dilution
        valences (list): list of the valences of the species in solution
        concentrations (list): list of the concentrations of the species in solution

    Returns:
        list: list of the mobilities corrected for ionic strength effects
    """
    e = 1.602e-19
    N_Av = 6.022e23
    c = np.array([0.2929, -0.3536, 0.0884, -0.0442, 0.0276, -0.0193])

    F = e * N_Av
    X = np.array(np.nonzero(valences)[0])
    XLen = len(X)

    z = np.array(valences)[X]
    mob = np.reshape(np.absolute(np.array(mobilities)[X] / F), (1, XLen))

    omega = mob / abs(z)
    updated_mob = np.zeros((1, XLen))

    conc = np.array(concentrations)[X]

    gamma = np.sum(conc * z**2)

    mu = np.reshape(conc * z**2 / gamma, (1, XLen))
    h = np.zeros((XLen, XLen))
    h = np.multiply(mu, omega) / np.add(
        omega, np.repeat(np.transpose(omega), XLen, axis=1)
    )

    h = h + np.diag(np.sum(h, axis=1))
    B = 2 * h - np.eye(XLen, XLen)

    r = np.zeros((XLen, len(c)))

    r[:, 0:1] = np.transpose(
        z - np.sum(z * mu) / np.sum(mu * np.absolute(z) / mob) * (np.absolute(z) / mob)
    )

    for n in range(1, len(c)):
        r[:, n] = np.dot(B, r[:, n - 1])

    factor = np.dot(c, np.transpose(r))

    updated_mob = z * (
        F * omega
        - (0.78420 * F * z * factor * omega + 31.410e-9)
        * np.sqrt(gamma / 2)
        / (1 + 1.5 * np.sqrt(gamma / 2))
    )

    return updated_mob


def create_mobility_plots(
    concentrations,
    valences,
    pKa,
    mobilities,
    labels,
    Npoints=500,
    ionic_effect_flag=False,
):
    """Creates mobility vs pH plots, taking into account ionic strength effects & acid/base dissociation

    Args:
        concentrations (array): list of total concentrations per species family, in molars (M).
        valences (list): list of valences per family per species (typically between -2 and 2)
        pKa (list): list of pKas per family per species (typically between 0 and 14)
        mobilities (list): list of mobilities per family per species (m^2/(V.s))
        Npoints (int, optional): Number of points in the plot. Defaults to 500.
        ionic_effect_flag (bool, optional): Accounts for ionic strengths effects. Defaults to False.

    Returns:
        list: list of pHs at which the calculations are done
        list: list of the mobilities for each of the pH value
    """
    lin_pH = np.linspace(0, 14, Npoints)
    sol = np.zeros((len(concentrations), Npoints))
    Nspecies = len(concentrations)

    for n, pH_ref in enumerate(lin_pH):

        all_valences_flat = []
        all_mobilities_flat = []
        zwitter = []

        # Add missing valences and mobilities
        for i, val in enumerate(valences):
            if val[-1] < 0:
                all_valences_flat = np.append(
                    all_valences_flat, np.append(val, val[-1] + 1)
                )
                all_mobilities_flat = np.append(
                    all_mobilities_flat, np.append(mobilities[i], 0)
                )
                zwitter = np.append(zwitter, False)
            elif val[0] > 0:
                all_valences_flat = np.append(
                    all_valences_flat, np.append(val[0] - 1, val)
                )
                all_mobilities_flat = np.append(
                    all_mobilities_flat, np.append(0, mobilities[i])
                )
                zwitter = np.append(zwitter, False)
            elif val[0] < 0 and val[-1] > 0:
                zwitter = np.append(zwitter, val.index(0))
                all_valences_flat = np.append(all_valences_flat, val)
                all_mobilities_flat = np.append(all_mobilities_flat, mobilities[i])

        # Compute concentrations based on chemical equilibrium
        all_concentrations_flat = []
        marker = 0
        for i, conc in enumerate(concentrations):
            if zwitter[i]:
                relevant_valences = all_valences_flat[
                    marker : marker + len(valences[i])
                ]
            else:
                relevant_valences = all_valences_flat[
                    marker : marker + len(valences[i]) + 1
                ]

            for val in relevant_valences:
                all_concentrations_flat = np.append(
                    all_concentrations_flat,
                    conc
                    * calc_gX(
                        val, list(relevant_valences), 10 ** -np.array(pKa[i]), pH_ref
                    ),
                )

            if zwitter[i]:
                marker += len(valences[i])
            else:
                marker += len(valences[i]) + 1

        # Compute new absolute mobilities with ionic strength dependence
        if ionic_effect_flag:
            new_mobs = compute_mobility_IS(
                all_mobilities_flat, all_valences_flat, all_concentrations_flat
            )

            new_mobs_complete = []
            marker = 0
            for i, mob in enumerate(mobilities):
                if zwitter[i]:
                    to_add = np.append(
                        new_mobs[0][marker : int(marker + zwitter[i])], 0
                    )
                    new_mobs_complete = np.append(
                        new_mobs_complete,
                        np.append(
                            to_add,
                            new_mobs[0][
                                int(marker + zwitter[i]) : marker + len(valences[i]) - 1
                            ],
                        ),
                    )
                elif mob[0] < 0:
                    new_mobs_complete = np.append(
                        new_mobs_complete,
                        np.append(new_mobs[0][marker : marker + len(valences[i])], 0),
                    )
                else:
                    new_mobs_complete = np.append(
                        new_mobs_complete,
                        np.append(0, new_mobs[0][marker : marker + len(valences[i])]),
                    )

                if zwitter[i]:
                    marker += len(valences[i]) - 1
                else:
                    marker += len(valences[i])

        # Plots
        marker = 0
        for i in range(Nspecies):
            if ionic_effect_flag:
                if zwitter[i]:
                    sol[i, n] = calc_mobility(
                        list(all_valences_flat[marker : marker + len(valences[i])]),
                        new_mobs_complete[marker : marker + len(valences[i])],
                        10 ** -np.array(pKa[i]),
                        pH_ref,
                    )
                else:
                    sol[i, n] = calc_mobility(
                        list(all_valences_flat[marker : marker + len(valences[i]) + 1]),
                        new_mobs_complete[marker : marker + len(valences[i]) + 1],
                        10 ** -np.array(pKa[i]),
                        pH_ref,
                    )
            else:
                if zwitter[i]:
                    sol[i, n] = calc_mobility(
                        list(all_valences_flat[marker : marker + len(valences[i])]),
                        all_mobilities_flat[marker : marker + len(valences[i])],
                        10 ** -np.array(pKa[i]),
                        pH_ref,
                    )
                else:
                    sol[i, n] = calc_mobility(
                        list(all_valences_flat[marker : marker + len(valences[i]) + 1]),
                        all_mobilities_flat[marker : marker + len(valences[i]) + 1],
                        10 ** -np.array(pKa[i]),
                        pH_ref,
                    )

            if zwitter[i]:
                marker += len(valences[i])
            else:
                marker += len(valences[i]) + 1

    return lin_pH, sol


concentrations = np.array([10e-3, 20e-3, 1e-3, 5e-3])
valences = [[-1], [1], [-1], [-1]]
pKa = [[-2], [8.076], [7.2], [7.5]]
mobilities = [[-7.91e-8], [2.95e-8], [-2.69e-8], [-2.35e-8]]
labels = ["HCl", "Tris", "MOPS", "HEPES"]

# sol1, sol2 are the values to plot on the y-axis. lin_pH is the x-axis.

lin_pH, sol1 = create_mobility_plots(
    concentrations, valences, pKa, mobilities, labels, ionic_effect_flag=False
)
lin_pH, sol2 = create_mobility_plots(
    concentrations, valences, pKa, mobilities, labels, ionic_effect_flag=True
)

Nspecies = len(concentrations)

for i in range(Nspecies):
    plt.plot(
        lin_pH, sol1[i, :] * 1e8, color=cmap(i / len(concentrations)), label=labels[i]
    )
    plt.plot(lin_pH, sol2[i, :] * 1e8, ":", color=cmap(i / len(concentrations)))

plt.ylabel(r"$\mu_X$ [$ 10^{-8}$ m²/(V$\cdot$s)]")
plt.xlabel("pH")
plt.legend()
plt.show()