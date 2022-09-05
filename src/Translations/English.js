module.exports = {
  common: {
    no: 'No',
    yes: 'Yes',
    done: 'Done',
    canceled: 'Canceled',
    rankingPosition: 'Ranking position',
    acquireDate: 'Acquired date',
    points: 'Points',
    giverName: 'Giver name',
    reasonName: 'Reason for granting',
  },
  buttons: {
    sendHimDirectMessage: 'Send him a direct message',
    createPublicMessage: 'Create a public message',
    doBoth: 'Do both',
  },
  commands: {
    addPoints: {
      description: 'Adds points to a user',
      options: {
        user: 'User name for which points points should be added',
        reason: 'Reason why points are being added',
        points: 'Number of points to add',
        comment: 'Comment',
      },
      errors: {
        invalidRange: (params) => `❗ Valid points range for the selected reason **${params.reasonName}** is ${params.min} to ${params.max}`,
        failure: (params) => `❗ Faield to add **${params.points}** points for **${params.userName}**`,
      },
      messages: {
        success: (params) => `✅ Added **${params.points}** points to user **${params.userName}** with reason **${params.reasonName}**\nWould you like to send notification?`,
        directMessage: (params) => `${params.giverName} added **${params.points}** points to you with reason ${params.reasonName}.`,
        directMessageSent: (params) => `✅ Direct message to **${params.userName}** was sent.`,
        publicMessage: (params) => `**${params.userName}** gained **${params.points}** points with reason ${params.reasonName}.`,
        publicMessageCreated: (params) => `✅ Public message at channel **${params.channelName}** was created.`,
      }
    },
    showPoints: {
      description: `Shows user's points`,
      errors: {
        failure: (params) => `❗ Faield get points for user **${params.userName}**`,
      },
      messages: {
        summary: (params) => `➡ You have **${params.points}** points acquired between ${params.minAcquireDate} and ${params.maxAcquireDate}`,
        recentPoints: (params) => `⬇ ${params.pointsCount} most recently given points`,
        rankingPositions: '⬇ Ranking positions',
      }
    },
    addReason: {
      description: 'Adds points add reason',
      options: {
        name: 'Name of a points add reason',
        min: 'Minimal number of points that can be added for this reason',
        max: 'Maximum number of points that can be added for this reason',
      },
      errors: {
        invalidName: '❗ Name of a points add reason can not be empty.',
        invalidRange: (params) => `❗ Invalid points range - minimal value ${params.min} can not be greater or equal to maximum value ${params.max}`,
        failure: '❗ Failed to add points add reason.',
      },
      messages: {
        success: (params) => `✅ Added new points add reason **${params.reasonName}**`,
      }
    },
    removeReason: {
      description: 'Removes existing points add reason.',
      options: {
        reason: 'Points add reason',
      },
      errors: {
        failure: (params) => `❗ Failed to removed points add reason **${params.reasonName}**`,
      },
      messages: {
        confirmation: (params) => `❓ Are you sure you want to remove points add reason **${params.reasonName}**?`,
        success: (params) => `✅ Removed points add reason **${params.reasonName}**`,
      }
    },
    changeReason: {
      description: 'Changes existing points add reason.',
      errors: {
        failure: (params) => `❗ Failed to change points add reason**${params.reasonName}**`,
      },
      messages: {
        confirmation: (params) => `❓ Are you sure you want to change points add reason **${params.reasonName}**?`,
        success: (params) => `✅ Changed points add reason **${params.reasonName}**`,
      }
    },
  }
};
