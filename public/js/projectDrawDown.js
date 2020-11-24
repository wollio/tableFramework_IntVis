//project drawdown data in GIGATONS CO^2 average value
let projectDrawDown = {
    electricity: {
        potential: 320.4,
        activePercentage: 0.0
    },
    food: {
        potential: 239.05,
        activePercentage: 0.0
    },
    industry: {
        potential: 136.6,
        activePercentage: 0.0
    },
    transportation: {
        potential: 77.7,
        activePercentage: 0.0
    },
    buildings: {
        potential: 107.45,
        activePercentage: 0.0
    },
    landSinks: {
        potential: 315.45,
        activePercentage: 0.0
    }
}

let activeSector = 'electricity';
let cummulativePercentage = 0.0;

function setAmountOfActiveSector(rotation) {

    projectDrawDown[activeSector].activePercentage = map(rotation, 0, 360, 0, 100);
    console.log(projectDrawDown[activeSector].activePercentage);
    updateCummulativePercentage();
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
