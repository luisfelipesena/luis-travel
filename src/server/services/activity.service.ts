import { type ParticipantStatus, TripMemberRole } from "@/types"
import type { Activity, NewActivity } from "../db/schema"
import { activityRepository } from "../repositories/activity.repository"
import { tripRepository } from "../repositories/trip.repository"

export class ActivityService {
  async getActivitiesByTripId(tripId: string, userId: string): Promise<Activity[]> {
    const hasAccess = await tripRepository.userHasAccess(tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    return activityRepository.findByTripId(tripId)
  }

  async getActivitiesByDateRange(
    tripId: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Activity[]> {
    const hasAccess = await tripRepository.userHasAccess(tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    return activityRepository.findByDateRange(tripId, startDate, endDate)
  }

  async createActivity(
    tripId: string,
    userId: string,
    data: Omit<NewActivity, "tripId" | "createdBy" | "createdAt" | "updatedAt">
  ): Promise<Activity> {
    const role = await tripRepository.getUserRole(tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    this.validateActivityTimes(data.startTime, data.endTime)

    return activityRepository.create({
      ...data,
      tripId,
      createdBy: userId,
    })
  }

  async createManyActivities(
    tripId: string,
    userId: string,
    activities: Omit<NewActivity, "tripId" | "createdBy" | "createdAt" | "updatedAt">[]
  ): Promise<Activity[]> {
    const role = await tripRepository.getUserRole(tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    for (const activity of activities) {
      this.validateActivityTimes(activity.startTime, activity.endTime)
    }

    return activityRepository.createMany(
      activities.map((a) => ({
        ...a,
        tripId,
        createdBy: userId,
      }))
    )
  }

  async updateActivity(
    activityId: string,
    userId: string,
    data: Partial<Omit<NewActivity, "id" | "tripId" | "createdBy" | "createdAt">>
  ): Promise<Activity> {
    const activity = await activityRepository.findById(activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    const role = await tripRepository.getUserRole(activity.tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    if (data.startTime && data.endTime) {
      this.validateActivityTimes(data.startTime, data.endTime)
    }

    return activityRepository.update(activityId, data)
  }

  async updateActivityTimes(
    activityId: string,
    userId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Activity> {
    const activity = await activityRepository.findById(activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    const role = await tripRepository.getUserRole(activity.tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    this.validateActivityTimes(startTime, endTime)

    return activityRepository.updateTimes(activityId, startTime, endTime)
  }

  async deleteActivity(activityId: string, userId: string): Promise<void> {
    const activity = await activityRepository.findById(activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    const role = await tripRepository.getUserRole(activity.tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    await activityRepository.delete(activityId)
  }

  private validateActivityTimes(startTime: Date, endTime: Date): void {
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time")
    }
  }

  // Participant methods
  async getActivityWithParticipants(activityId: string, userId: string) {
    const activity = await activityRepository.findByIdWithParticipants(activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    const hasAccess = await tripRepository.userHasAccess(activity.tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    return activity
  }

  async getActivitiesWithParticipants(tripId: string, userId: string) {
    const hasAccess = await tripRepository.userHasAccess(tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    return activityRepository.findByTripIdWithParticipants(tripId)
  }

  async setActivityParticipants(
    activityId: string,
    userId: string,
    participantIds: string[]
  ): Promise<void> {
    const activity = await activityRepository.findById(activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    const role = await tripRepository.getUserRole(activity.tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    // Validate all participants are trip members
    const members = await tripRepository.getMembers(activity.tripId)
    const memberIds = new Set(members.map((m) => m.userId))
    const trip = await tripRepository.findById(activity.tripId)

    if (trip) {
      memberIds.add(trip.ownerId)
    }

    for (const participantId of participantIds) {
      if (!memberIds.has(participantId)) {
        throw new Error("Invalid participant - not a trip member")
      }
    }

    await activityRepository.setParticipants(activityId, participantIds)
  }

  async updateParticipantStatus(
    activityId: string,
    userId: string,
    status: ParticipantStatus
  ): Promise<void> {
    const activity = await activityRepository.findById(activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    const hasAccess = await tripRepository.userHasAccess(activity.tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    await activityRepository.updateParticipantStatus(activityId, userId, status)
  }
}

export const activityService = new ActivityService()
