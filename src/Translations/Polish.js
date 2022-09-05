module.exports = {
  common: {
    no: 'Nie',
    yes: 'Tak',
    done: 'Zrobiono',
    canceled: 'Anulowano',
    rankingPosition: 'Pozycja w rankingu',
    acquireDate: 'Data przyznania',
    points: 'Punkty',
    giverName: 'Osoba przynająca',
    reasonName: 'Powód przyznania',
  },
  buttons: {
    sendHimDirectMessage: 'Wyślij mu prywatną wiadomość',
    createPublicMessage: 'Stwórz wiadomość na kanale publicznym',
    doBoth: 'Wykonaj jedno i drugie',
  },
  autoCompete: {
    recentlyGivenPoints: (params) => `${params.points} punkty przyznane dnia ${params.acquireDate} z powodu ${params.reasonName}`,
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
        failure: (params) => `❗ Nie udało się dodać **${params.points}** punktów uzytkownikowi **${params.userName}**`,
      },
      messages: {
        success: (params) => `✅ Dodano **${params.points}** punkty uzytkownikowi **${params.userName}** z powodu **${params.reasonName}**\nCzy chcesz wysłać notyfikacje?`,
        directMessage: (params) => `${params.giverName} dodał tobie **${params.points}** punkty z powodu ${params.reasonName}.`,
        directMessageSent: (params) => `✅ Wiadomość prywatna do uzytkownika **${params.userName}** została wysłana.`,
        publicMessage: (params) => `**${params.userName}** zyskał **${params.points}** punkty z powodu ${params.reasonName}.`,
        publicMessageCreated: (params) => `✅ Publiczna wiadomość została stworzona na kanale **${params.channelName}**`,
      }
    },
    removePoints: {
      description: 'Usuwa wcześniej dodane uzytkownikowi punkty',
      options: {
        user: 'Nazwa uzytkownika, któremu nalezy usunąć punkty',
        recentlyGivenPoints: 'Ostatnio przyznane punkty przez ciebie punkty',
      },
      errors: {
        failure: (params) => `❗ Nie udało się usunąć **${params.points}** punktów uzytkownikowi **${params.userName}**`,
      },
      messages: {
        confirmation: (params) => `❓ Czy na pewno chcesz usunąć **${params.points}** punkty przyznanych uzytkownikowi **${params.userName}** dnia ${params.acquireDate} z powodu ${params.reasonName}?`,
        success: (params) => `✅ Usunięto **${params.points}** punkty uzytkownikowi **${params.userName}**`,
      }
    },
    showPoints: {
      description: 'Pokazuje punkty przyznane uzytkownikowi',
      errors: {
        failure: (params) => `❗ Nie udało się pobrać punktów dla uzytkownika **${params.userName}**`,
      },
      messages: {
        summary: (params) => `➡ Masz **${params.points}** punktów zdobytych pomiędzy ${params.minAcquireDate} a ${params.maxAcquireDate}`,
        recentPoints: (params) => `⬇ ${params.pointsCount} ostatnio przyznane punkty`,
        rankingPositions: '⬇ Pozycje w rankingu',
      }
    },
    addReason: {
      description: 'Dodaje nowy powód do przyznawania punktów',
      options: {
        name: 'Nazwa',
        min: 'Minimalna liczba punktów jaką mozna przyznać',
        max: 'Maksymalna liczba punktów jaką mozna przyznać',
      },
      errors: {
        invalidName: '❗ Nazwa powodu do przyznawania punktów nie moze być pusta.',
        invalidRange: (params) => `❗ Nieprawidłowy zakres punktów - wartość minimalna ${params.min} nie moze byc wieksza lub równa wartości maksymalnej ${params.max}`,
        failure: '❗ Nie udało się dodać nowego powodu do przyznawania punktów.',
      },
      messages: {
        success: (params) => `✅ Dodano nowy powód do przynawania punktów **${params.reasonName}**`,
      }
    },
    removeReason: {
      description: 'Usuwa istniejący powód do przyznawania punktów',
      options: {
        reason: 'Powód dodania punktów',
      },
      errors: {
        failure: (params) => `❗ Nie udało się usunąć powodu do przyznawania punktów **${params.reasonName}**`,
      },
      messages: {
        confirmation: (params) => `❓ Czy na pewno chcesz usunąć powód do przyznania punktów **${params.reasonName}**?`,
        success: (params) => `✅ Usunięto powód przyznania punktów **${params.reasonName}**`,
      }
    },
    changeReason: {
      description: 'Zmienia istniejący powód do przyznawania punktów',
      errors: {
        failure: (params) => `❗ Nie udało się zmianić powodu do przyznawania punktów **${params.reasonName}**`,
      },
      messages: {
        confirmation: (params) => `❓ Czy na pewno chcesz zmienić powód do przyznania punktów **${params.reasonName}**?`,
        success: (params) => `✅ Zmieniono powód przyznania punktów **${params.reasonName}**`,
      }
    },
  }
};
