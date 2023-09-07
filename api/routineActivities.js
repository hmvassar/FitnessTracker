const express = require('express');
const router = express.Router();
const { requireUser } = require("./utils");
const {
  updateRoutineActivity,
  getRoutineById,
  destroyRoutineActivity,
  getRoutineActivityById,
} = require("../db");


// PATCH /api/routine_activities/:routineActivityId


 router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
   const { duration, count } = req.body;
   const id = req.params.routineActivityId;
   const routineCreator = await getRoutineById(id);
   try {
     if (routineCreator.creatorId != req.user.id) {
       res.status(403);
       next({
        error: "Unauthorized",
         name: "invalid User",
         message: `User ${req.user.username} is not allowed to update ${routineCreator.name}`,
       });
     }
     const updatedRoutine = await updateRoutineActivity({
       id,
       duration,
       count,
       ...req.body,
     });
     res.send(updatedRoutine);
   } catch ({error, name, message }) {
     next({ error,name, message });
   }
 });

// DELETE /api/routine_activities/:routineActivityId

 router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
   const id = req.params.routineActivityId;
   const newRoutineActivity = await getRoutineActivityById(id);
   const newRoutineById = await getRoutineById(newRoutineActivity.id);
   try {
     if (newRoutineById.creatorId != req.user.id) {
       res.status(403);
       next({
         error: "User Unauthorized",
         name: "Does not match the user",
         message: `User ${req.user.username} is not allowed to delete ${newRoutineById.name}`,
       });
     }
     await destroyRoutineActivity(id);
     res.send(newRoutineActivity);
   } catch ({error,name,message}) {
     next({error,name,message});
   }
 });



module.exports = router;