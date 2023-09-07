const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
    try {
      const {
        rows: [activity],
      } = await client.query(
        `
    INSERT INTO routine_activities ("routineId", "activityId", duration, count)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `,
        [routineId, activityId, duration, count]
      );
      return activity;
    } catch (error) {
      return error;
    }
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [routineActivity] } = await client.query(
      `
   SELECT * FROM routine_activities WHERE id=$1; 
    `,
      [id]
    );
    return routineActivity;
  } catch (error) {
    console.log("error routineActivitiesById");
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
   try {
     const { rows: activityByRoutine } = await client.query(
       `
    SELECT * FROM routine_activities WHERE "routineId"=$1;
    `,
       [id]
     );

     return activityByRoutine;
   } catch (error) {
     console.log("error getting routine activity by routine");
     throw error;
   }
}

async function updateRoutineActivity({ id, ...fields }) {
  const { duration, count } = fields;
  // don't try to update the id
  try {
    if (duration && count) {
      const {
        rows: [updatedRoutineActivity],
      } = await client.query(
        `
    UPDATE routine_activities
    SET duration=$1, count=$2
    WHERE id=${id}
    RETURNING *`,
        [duration, count]
      );
      return updatedRoutineActivity;
    } else if (duration) {
      const {
        rows: [updatedRoutineActivity],
      } = await client.query(
        `
    UPDATE routine_activities
    SET duration=$1
    WHERE id=${id}
    RETURNING *`,
        [duration]
      );
      return updatedRoutineActivity;
    } else if (count) {
      const {
        rows: [updatedRoutineActivity],
      } = await client.query(
        `
    UPDATE routine_activities
    SET count=$1
    WHERE id=${id}
    RETURNING *`,
        [count]
      );
      return updatedRoutineActivity;
    } else {
      return;
    }
  } catch (error) {
    return error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [destroyActivity] } = await client.query(
      `
  DELETE FROM routine_activities WHERE routine_activities.id=$1
  RETURNING *;
  `,
      [id]
    );

    return destroyActivity;
  } catch (error) {
    console.log("error destroing an routine activity");
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {
    rows: [activity]
  } = await client.query(`
  SELECT * FROM routine_activities 
  JOIN routines 
  ON routine_activities."routineId"=routines.id 
  WHERE routine_activities."activityId"=$1;`
  , [routineActivityId]);
  console.log(activity)
  if (activity.creatorId === userId) {
    return true
  } else {
    return false
  }
  } catch (error) {
    return error
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};