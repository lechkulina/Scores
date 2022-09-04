module.exports = {
  common: {
    no: 'Nie',
    done: 'Zrobiono',
    rankingPosition: 'Pozycja w rankingu',
    acquireDate: 'Data przyznania',
    points: 'Punkty',
    giverName: 'Osoba przynająca',
    reasonName: 'Powód przyznania',
    comment: 'Komentarz'
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
    },
    showPoints: {
      description: 'Pokazuje punkty przyznane uzytkownikowi',
      errors: {
        genericFailure: (params) => `❗ Nie udało się pobrać punktów dla uzytkownika **${params.userName}**`,
      },
      messages: {
        summaryStatus: (params) => `➡ Masz **${params.points}** punktów zdobytych pomiędzy ${params.minAcquireDate} a ${params.maxAcquireDate}`,
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
        genericFailure: '❗ Nie udało się dodać nowego powodu do przyznawania punktów.',
      },
      messages: {
        successStatus: (params) => `✅ Dodano nowy powód do przynawania punktów **${params.reasonName}**`,
      }
    }
  }
};
