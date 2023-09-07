const express = require('express');
const router = express.Router();
const { requireUser } = require('./utils');
const { getAllPublicRoutines, createRoutine, updateRoutine, getRoutineById, destroyRoutine } = require('../db/routines');
const { addActivityToRoutine, getRoutineActivitiesByRoutine } = require('../db/routine_activities')

// GET /api/routines
router.get('/', async (req, res, next) => {
try {
    const routines = await getAllPublicRoutines()
    res.status(200).send(routines)
} catch ({error, name, message}) {
    next({ error, name, message });
}
})

// POST /api/routines
router.post('/', requireUser, async (req, res, next) => {
    try {
        const createdRoutine = await createRoutine({
            creatorId: req.user.id,
            isPublic: req.body.isPublic,
            name: req.body.name,
            goal: req.body.goal
        });
        if (!createdRoutine) {
            next({
                error: "Creation Error",
                name: "RoutineNotCreated",
                message: "Routine could not be created"
            })
        } else {
        res.status(200).send(createdRoutine);
        }

    } catch ({error, name, message}) {
        next({ error, name, message });
    }
})

// PATCH /api/routines/:routineId
router.patch('/:routineId', requireUser, async (req, res, next) => {
    try {
        const { routineId } = req.params
        //check if user is the creator
        const routineCreator = await getRoutineById(routineId)
        if (routineCreator.creatorId !== req.user.id) {
            res.status(403).send({
                error: "Unauthorized",
                name: "Invalid User",
                message: `User ${req.user.username} is not allowed to update ${routineCreator.name}`
            })
        }

        const updatedRoutine = await updateRoutine({
            id: routineId,
            ...req.body
        })
        res.status(200).send(updatedRoutine);

    } catch ({error, name, message}) {
        next({error, name, message}); 
    }
})

// DELETE /api/routines/:routineId
router.delete('/:routineId', requireUser, async (req, res, next) => {
    try {
        const { routineId } = req.params
        //check if user is the creator
        const routineCreator = await getRoutineById(routineId)
        if (routineCreator.creatorId !== req.user.id) {
            res.status(403).send({
                error: "Unauthorized",
                name: "Invalid User",
                message: `User ${req.user.username} is not allowed to delete ${routineCreator.name}`
            })
        }

        const {deletedRoutine} = await destroyRoutine(routineId);
        res.status(200).send(deletedRoutine);

    } catch ({error, name, message}) {
        next({error, name, message})
    }
})

// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', requireUser, async (req, res, next) => {
    try {
        const { routineId } = req.params
        //check for existing activity
        const routineActivities = await getRoutineActivitiesByRoutine({id:routineId});
        // console.log(routineActivities)
        if (routineActivities.length) {
            routineActivities.map((routine) => {
                if (routine.activityId === req.body.activityId) {
                    next({
                      error: "Creation Error",
                      name: "ActivityExistsInRoutine",
                      message: `Activity ID ${req.body.activityId} already exists in Routine ID ${routineId}`,
                    });
                }
            })
        }

        const addedActivity = await addActivityToRoutine({
          routineId: routineId,
          activityId: req.body.activityId,
          count: req.body.count,
          duration: req.body.duration
        });
        res.status(200).send(addedActivity);
    } catch ({error, name, message}) {
        next({error, name, message})
    }
    
})

module.exports = router;