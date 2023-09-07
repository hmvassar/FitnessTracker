const express = require('express');
const router = express.Router();


const { createActivity, getAllActivities, getActivityByName, updateActivity, getActivityById } = require('../db/activities')
const { getPublicRoutinesByActivity } = require('../db/routines')
const { requireUser } = require("./utils.js");

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
    const { activityId } = req.params;
    //check for activity
    const activityExists = await getActivityById(activityId);
    if (!activityExists) {
      next({
        error: "Activity update error",
        name: "Activity doesn't exist",
        message: `Activity ${activityId} not found`,
      });
    }

    try {
        const publicRoutines = await getPublicRoutinesByActivity({id: activityId})
        res.status(200).send(publicRoutines)
    } catch ({error, name, message}) {
        next({error, name, message})        
    }
})

// GET /api/activities
router.get('/', async (req, res, next) => {
    try {
        const activities = await getAllActivities()
        res.status(200).send(activities)
    } catch ({ error, name, message}) {
        next({ error, name, message})
    }
})

// POST /api/activities
router.post('/', requireUser, async (req, res, next) => {
    try {
        //check for existing activity
        const activityExists = await getActivityByName(req.body.name)
        if (activityExists) {
            next({
                error: "Activity cannot be created",
                name: "Duplicate Activity",
                message: `An activity with name ${req.body.name} already exists`
            })
        }
        const createdActivity = await createActivity(req.body)
        res.status(200).send(createdActivity)

    } catch ({error, name, message}) {
        next({name, error, message})
    }
})

// PATCH /api/activities/:activityId
router.patch('/:activityId', requireUser, async (req, res, next) => {
    try {
        const { activityId } = req.params;
        //check for activity in database
        const activityExists = await getActivityById(activityId)
        if(!activityExists) {
            next({
                error: "Activity update error",
                name: "Activity doesn't exist",
                message: `Activity ${activityId} not found`
            })
        }
        //check for name conflict
        const activityNameInUse = await getActivityByName(req.body.name)
        if(activityNameInUse) {
            next({
              error: "Activity update error",
              name: "Activity already exists",
              message: `An activity with name ${req.body.name} already exists`
            });
        }
        
        const updatedActivity = await updateActivity({
            id: activityId, 
            name: req.body.name, 
            description: req.body.description
        });

        res.status(200).send(updatedActivity);
    } catch ({error, name, message}) {
        next({name, error, message})
    }
})

module.exports = router;