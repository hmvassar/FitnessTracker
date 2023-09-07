const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  // const setLowerCaseName = name.toLowerCase()
  try {
    const {rows: [newActivity]} = await client.query(
      `INSERT INTO activities (name, description) 
    VALUES ($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
`,
      [name, description]
    );
    return newActivity;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAllActivities() {
  // select and return an array of all activities
   try {
    const { rows } = await client.query(`
  SELECT * FROM activities;`);
    return rows;
   } catch (error) {
    return error
   }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
  SELECT * FROM activities
  WHERE id=$1;`,
      [id]
    );
    return activity;
  } catch (error) {
   return error
  }
}

async function getActivityByName(name) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
  SELECT * FROM activities
  WHERE name=$1;`,
      [name]
    );
    return activity;
  } catch (error) {
    return error
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  // console.log("Routines before activities", routines)
  async function getActivitiesByRoutineId(routineId) {
    try {
      const { rows: activities } = await client.query(
        `
      SELECT * FROM activities
       JOIN routine_activities
        ON routine_activities."activityId"=activities.id
      WHERE activities.id IN (SELECT "activityId" FROM routine_activities WHERE "routineId"=$1);`,
        [routineId]
      );

      return activities;
    } catch (error) {
      return error
    }
  }
  
  for (const routine of routines) {
    const activities = await getActivitiesByRoutineId(routine.id);
    // console.log("activities:", activities)
    routine.activities = activities;
  }
  // console.log("Routines after activities", routines);
  return routines;
}

async function updateActivity({ id, ...fields }) {
  const { name, description } = fields
  // don't try to update the id
  try {
    if (name && description) {
    const { rows: [updatedActivity] } = await client.query(`
    UPDATE activities
    SET name=$1, description=$2
    WHERE id=${id}
    RETURNING *;`
    , [name, description])
    return updatedActivity
    } else if (name) {
      const {
        rows: [updatedActivity]
      } = await client.query(
        `
    UPDATE activities
    SET name=$1
    WHERE id=${id}
    RETURNING *;`,
        [name]
      );
      return updatedActivity;
    } else if (description) {
      const {
        rows: [updatedActivity]
      } = await client.query(
        `
    UPDATE activities
    SET description=$1
    WHERE id=${id}
    RETURNING *;`,
        [description]
      );
      return updatedActivity;
    } else {
      return
    }
  } catch (error) {
    return error
  }
  // do update the name and description
  // return the updated activity
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
