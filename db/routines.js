const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [newRoutine] } = await client.query(`
      INSERT INTO routines ("creatorId", "isPublic", name, goal) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [creatorId, isPublic, name, goal]
    );
    return newRoutine;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
SELECT * FROM routines WHERE id=$1;
    `,
      [id]
    );

    return routine;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
    SELECT * FROM routines;`)
    return rows;
  } catch (error) {
    return error
  }
}

async function getAllRoutines() {
   try {
    //get all routines
    const { rows: allRoutines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines 
    JOIN users ON routines."creatorId"=users.id;
    `);
    
    // console.log("after getting all routines", routinesWithActivities);
    const routinesWithActivities = await attachActivitiesToRoutines(allRoutines);
    return routinesWithActivities;
  } catch (error) {
    return error
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users
    ON routines."creatorId"=users.id
    WHERE "isPublic"=true;
     `);
    const routinesWithActivities = await attachActivitiesToRoutines(
      routines
    );
    // console.log("after getting all routines", routinesWithActivities);
    return routinesWithActivities;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
try {
  const { rows: routines } = await client.query(`
   SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.Id
      WHERE username=$1;
  `,[username]);
  
  const routinesWithActivities = await attachActivitiesToRoutines(routines)
  return routinesWithActivities;
} catch (error) {
  console.log("error gettin a routine by user");
  throw error;
}
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.Id
      WHERE "isPublic"=true AND username=$1;
    `,
      [username]
    );
    const routinesWithActivities = await attachActivitiesToRoutines(routines)
      return routinesWithActivities;
  } catch (error) {
    console.error("error getting a public routine by user");
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  console.log(id)
try {
  const { rows: publicRoutines } = await client.query(
    `
  SELECT routines.*, users.username AS "creatorName"
 FROM routines
 JOIN users
  ON routines."creatorId"=users.id
  WHERE "isPublic"=true AND routines.id IN (SELECT "routineId" FROM routine_activities WHERE "activityId"=$1);
  `,
    [id]
  );
  const routinesWithActivities = await attachActivitiesToRoutines(publicRoutines);
  // console.log(publicRoutines);
  return routinesWithActivities;
  
} catch (error) {
  console.error("error getting public routines by activity");
  throw error;
}
}

async function updateRoutine({ id, ...fields }) {
  // Object.keys method returns an array of the keys of the fields object.
  const newString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(",");
  try {
    if (newString.length > 0) {
      const {
        rows: [updatedRoutine],
      } = await client.query(
        `
      UPDATE routines
      SET ${newString}
      WHERE id=${id}
      RETURNING *;
      `,
        Object.values(fields)
      );
      return updatedRoutine;
    }
  } catch (error) {
    console.log("error updating routine");
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    const { rows: routine_activities } = await client.query(
      `
      DELETE FROM routine_activities WHERE "routineId"=$1;`,
      [id]
    );
    const { rows } = await client.query(
      `
  DELETE FROM routines
  WHERE id=$1
  RETURNING *;
`,
      [id]
    );

    const outturn = {
      deletedRoutineActivity: routine_activities[0],
      deletedRoutine: rows[0],
    };
    return outturn;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// getAllRoutines();

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};