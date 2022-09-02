module.exports = {
  common: {
    no: 'No',
    done: 'Done',
    rankingPosition: 'Ranking position',
    acquireDate: 'Acquired date',
    points: 'Points',
    giverName: 'Giver name',
    reasonName: 'Reason for granting',
    comment: 'Comment',
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
        genericFailure: (params) => `❗ Faield to add **${params.points}** points for **${params.userName}**`,
      },
      messages: {
        successStatus: (params) => `✅ Added **${params.points}** points to user **${params.userName}** with reason **${params.reasonName}**\nWould you like to send notification?`,
        directMessage: (params) => `${params.giverName} added **${params.points}** points to you with reason ${params.reasonName}.`,
        directMessageStatus: (params) => `✅ Direct message to **${params.userName}** was sent.`,
        publicMessage: (params) => `**${params.userName}** gained **${params.points}** points with reason ${params.reasonName}.`,
        publicMessageStatus: (params) => `✅ Public message at channel **${params.channelName}** was created.`,
      }
    },
    showPoints: {
      description: `Shows user's points`,
      errors: {
        genericFailure: (params) => `❗ Faield get points for user **${params.userName}**`,
      },
      messages: {
        summaryStatus: (params) => `➡ You have **${params.points}** points acquired between ${params.minAcquireDate} and ${params.maxAcquireDate}`,
        recentPoints: (params) => `⬇ ${params.pointsCount} most recently given points`,
        rankingPositions: '⬇ Ranking positions',
      }
    }
  }
};
