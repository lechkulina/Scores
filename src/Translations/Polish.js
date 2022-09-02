module.exports = {
  common: {
    no: 'Nie',
    done: 'Zrobiono',
  },
  buttons: {
    sendHimDirectMessage: 'Wyślij mu prywatną wiadomość',
    createPublicMessage: 'Stwórz wiadomość na kanale publicznym',
    doBoth: 'Wykonaj jedno i drugie',
  },
  commands: {
    addPoints: {
      description: 'Dodaje punkty uzytkownikowi',
      options: {
        user: 'Nazwa uzytkownika dla którego punkty zostaną dodane',
        reason: 'Powód dodania punktów',
        points: 'Liczba punktów do dodania',
        comment: 'Komentarz',
      },
      errors: {
        invalidRange: (params) => `❗ Prawidłowy zakres punktów dla powodu **${params.reasonName}** wynosi od ${params.min} do ${params.max}`,
        genericFailure: (params) => `❗ Nie udało się dodać **${params.points}** punktów uzytkownikowi **${params.userName}**`,
      },
      messages: {
        successStatus: (params) => `✅ Dodano **${params.points}** punkty uzytkownikowi **${params.userName}** z powodu **${params.reasonName}**\nCzy chcesz wysłać notyfikacje?`,
        directMessage: (params) => `${params.giverName} dodał tobie **${params.points}** punkty z powodu ${params.reasonName}.`,
        directMessageStatus: (params) => `✅ Wiadomość prywatna do uzytkownika **${params.userName}** została wysłana.`,
        publicMessage: (params) => `**${params.userName}** zyskał **${params.points}** punkty z powodu ${params.reasonName}.`,
        publicMessageStatus: (params) => `✅ Publiczna wiadomość została stworzona na kanale **${params.channelName}**`,
      }
    }
  }
};
