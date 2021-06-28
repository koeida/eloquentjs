var _ = require('underscore');

const roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  random(parcelCount = 5) {
    let parcels = [];

    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      let place;

      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place == address);

      parcels.push({place, address});
    }

    return new VillageState("Post Office", parcels);
  }
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
};

let moveRobot = function(v, destination) {
  if (!roadGraph[v.place].includes(destination)) {
    return v;
  } else {
    let parcels = v.parcels.map(p => {
      if (p.place != v.place) return p;
      return {place: destination, address: p.address};
    }).filter(p => p.place != p.address);
    return new VillageState(destination, parcels);
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      return turn;
    }
    let action = robot(state, memory);
    state = moveRobot(state, action.direction);
    memory = action.memory;
  }
}

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}]; //places that should be explored next + route that got us there
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      // if this adjacent place we're looking at
      // isn't already in our list of plces to explore
      if (!work.some(w => w.at == place)) {
        //Push this adjacent place we're looking at
        //to the work list along with the route we took to get here.
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }

  return {direction: route[0], memory: route.slice(1)};
}

/*
   Write a function compareRobots that takes two robots (and their starting memory).
   It should generate 100 tasks and let each of the robots solve each of these tasks.
   When done, it should output the average number of steps each robot took per task.

  For the sake of fairness, make sure you give each task to both robots,
  rather than generating different tasks per robot.
*/
function compareRobots(robot1, memory1, robot2, memory2) {
  let r1steps = [];
  let r2steps = [];
  let sum = function(l) { return l.reduce((a,x) => a + x); };
  let avg = function(l) { return sum(l) / l.length; };

  for (let x = 0; x < 100; x++) {
    let village = VillageState.random();
    r1steps.push(runRobot(village, robot1, memory1));
    r2steps.push(runRobot(village, robot2, memory2));
  }

  console.log("Average steps for robot 1: " + avg(r1steps));
  console.log("Average steps for robot 2: " + avg(r2steps));
}

/*
  Can you write a robot that finishes the delivery task faster than goalOrientedRobot?
  If you observe that robot’s behavior, what obviously stupid things does it do?
  How could those be improved?

  koeida says: Well, it isn't picking the next destination based on which one has
  the shortest route. That's a quick fix.

  A more complex fix might be trying out all possible combinations of routes and seeing
  which requires the shortest total steps.

  Lets do the first fix.
*/

function getNewRoute(place, parcels) {
  let parcelRoutes = parcels.map((p) =>  {
    if (p.place != place) {
      return findRoute(roadGraph, place, p.place);
    } else {
      return findRoute(roadGraph, place, p.address);
    }
  });
  let sortedRoutes = parcelRoutes.slice(0).sort((a,b) => a.length - b.length);
  return sortedRoutes[0];
}

function betterGoalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    route = getNewRoute(place, parcels);
  }

  return {direction: route[0], memory: route.slice(1)};
}

compareRobots(goalOrientedRobot, [], betterGoalOrientedRobot, []);

//runRobot(VillageState.random(), goalOrientedRobot, []);

//let initialState = new VillageState(
//  "Post Office",
//  [{place: "Post Office", address: "Alice's House"}]
//);
//let newState = moveRobot(initialState, "Alice's House");
//console.log(newState);
//