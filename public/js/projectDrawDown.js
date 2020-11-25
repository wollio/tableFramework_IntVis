//project drawdown data in GIGATONS CO^2 average value
let projectDrawDown = {
    electricity: {
        potential: 320.4,
        activePercentage: 0.0,
        description: "Production of electricity must move away from fossil fuels, as quickly as possible. A spectrum of solutions can help, from small-scale/distributed to large-scale/centralized. Some solutions harvest photons from the sun. Others tap nature’s generous kinetic energy—the movement of wind and water. Still others use an alternate source of heat, such as geothermal or nuclear, for the same basic steam-turbine process."
    },
    food: {
        potential: 239.05,
        activePercentage: 0.0,
        description: "Food desc"
    },
    industry: {
        potential: 136.6,
        activePercentage: 0.0,
        description: "industry desc"
    },
    transportation: {
        potential: 77.7,
        activePercentage: 0.0,
        description: "transportation desc"
    },
    buildings: {
        potential: 107.45,
        activePercentage: 0.0,
        description: "building desc"
    },
    landSinks: {
        potential: 315.45,
        activePercentage: 0.0,
        description: "land sinks desc"
    }
}

function getActivePercentageOfActiveSector() {
    return projectDrawDown[activeSector].activePercentage;
}

function getActiveSectorProjectDescription() {
    return projectDrawDown[activeSector].description;
}

let activeSector = 'electricity';
let cummulativePercentage = 0.0;

//clock wise count up / counter clock count down
function setAmountOfActiveSector(oldRotation, newRotation) {
    if ((newRotation < oldRotation || oldRotation < 100 && newRotation > 250) && getActivePercentageOfActiveSector() < 100) {
        projectDrawDown[activeSector].activePercentage = getActivePercentageOfActiveSector() + 1;
        updateCummulativePercentage();
    } else if (oldRotation !== newRotation && getActivePercentageOfActiveSector() > 0) {
        projectDrawDown[activeSector].activePercentage = getActivePercentageOfActiveSector() - 1;
        updateCummulativePercentage();
    }
}

/**
 *  updates the cummulative activePercentage value of each sector taking the total potential into account
 */
function updateCummulativePercentage() {
    let totalPotential = 0;
    let activePotential = 0;
    Object.keys(projectDrawDown).forEach(key => {
        totalPotential += projectDrawDown[key].potential;
        activePotential += projectDrawDown[key].potential * projectDrawDown[key].activePercentage / 100;
    });

    cummulativePercentage = activePotential / totalPotential * 100;

    console.log(`cummulativePercentage: ${cummulativePercentage}`);
}
