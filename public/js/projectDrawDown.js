//project drawdown data in GIGATONS CO^2 average value
let projectDrawDown = {
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
    electricity: {
        potential: 320.4,
        activePercentage: 0.0,
        description: `
        <h5>Enhance Efficiency</h5>
        Electricity efficiency solutions include technologies and practices that reduce demand for electricity generation, literally lightening the load. The two biggest end-users of electricity are buildings and industry, in roughly equal measure. While a home or factory may be the location of efficiency measures, these emissions get counted at the power plant where they are created or avoided, as part of the electricity sector. (See further exploration of buildings and industry below.)
        
        <h5>Shift Production</h5>
        Production of electricity must move away from fossil fuels, as quickly as possible. A spectrum of solutions can help, from small-scale/distributed to large-scale/centralized. Some solutions harvest photons from the sun. Others tap nature’s generous kinetic energy—the movement of wind and water. Still others use an alternate source of heat, such as geothermal or nuclear, for the same basic steam-turbine process.
        
        <h5>Improve the System</h5>
        To enable the transition to renewable electricity production and use, the broader electricity system also needs to evolve and upgrade. Flexible grids for transmission and effective energy storage make it possible to better balance electricity supply with demand.
        `
    },
    landSinks: {
        potential: 315.45,
        activePercentage: 0.0,
        description: "land sinks desc"
    },
    buildings: {
        potential: 107.45,
        activePercentage: 0.0,
        description: "building desc"
    },
    transportation: {
        potential: 77.7,
        activePercentage: 0.0,
        description: "transportation desc"
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
