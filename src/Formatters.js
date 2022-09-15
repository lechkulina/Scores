const {msInSecond, msInMinute, msInHour, msInDay, msInWeek} = require('./constants');

const Entities = {
  NoFormat: '```',
  Bold: '**',
  NewLine: '\n',
  EmptyLine: '\n\n',
  VerticalSeparator: '║',
  JointSeparator: '╬',
  HorizontalSeparator: '═',
  Ellipsis: '...',
};

const defaultRoundWidthTo = 8;

function formatTable({
  rows,
  columnsOrder: propsColumnsOrder,
  columnsLabels: propsColumnsLabels,
  roundWidthTo = defaultRoundWidthTo
}) {
  const columnsWidths = {};
  const columnsLabels = propsColumnsLabels ?? {};
  rows.forEach(row => {
    const names = Object.keys(row);
    names.forEach(name => {
      if (!columnsWidths[name]) {
        if (!columnsLabels[name]) {
          columnsLabels[name] = name;
        }
        columnsWidths[name] = columnsLabels[name].length + 1; // one is added to make sure that there is an exptra space on left side
      }
      const value = `${row[name]}`;
      columnsWidths[name] = Math.max(columnsWidths[name], value.length);
    });
  });
  const columnsOrder = propsColumnsOrder ?? Object.keys(columnsWidths);
  Object.keys(columnsWidths).forEach(name => {
    columnsWidths[name] = Math.ceil(columnsWidths[name] / roundWidthTo) * roundWidthTo;
  });
  const fixed = (length, string) => {
    return ' '.repeat(length - string.length) + `${string}`;
  };
  const header = columnsOrder.map(name => (
    fixed(columnsWidths[name], columnsLabels[name])
  )).join(` ${Entities.VerticalSeparator}`);
  const separator = columnsOrder.map(name => (
    Entities.HorizontalSeparator.repeat(columnsWidths[name])
  )).join(`${Entities.HorizontalSeparator}${Entities.JointSeparator}`);
  const content = rows.map(row => (
    columnsOrder.map(name => {
      const value = row[name];
      return fixed(columnsWidths[name], `${value}`);
    }).join(` ${Entities.VerticalSeparator}`)
  )).join(Entities.NewLine);
  return [
    Entities.NoFormat,
    header,
    separator,
    content,
    Entities.NoFormat,
  ].join(Entities.NewLine);
}

function formatMessageTable({message, ...props}) {
  return `${message}${Entities.NewLine}${formatTable(props)}`;
}

function formatEllipsis(text, limit) {
  const ellipsisLength = Entities.Ellipsis.length;
  const textLengthLimit = limit - ellipsisLength;
  if (text.length < textLengthLimit) {
    return text;
  }
  return text.slice(0, textLengthLimit) + Entities.Ellipsis;
}

function formatDuration(translate, duration, includeSeconds = false) {
  const sections = [];
  const pushSection = (count, key) => {
    if (count > 0) {
      sections.push(translate(key, {count}));
    }
  };
  const weeks = Math.floor(duration / msInWeek);
  duration -= weeks * msInWeek;
  const days = Math.floor(duration / msInDay);
  duration -= days * msInDay;
  const hours = Math.floor(duration / msInHour);
  duration -= hours * msInHour;
  const minutes = Math.floor(duration / msInMinute);
  duration -= minutes * msInMinute;
  pushSection(weeks, 'formatters.weeks');
  pushSection(days, 'formatters.days');
  pushSection(hours, 'formatters.hours');
  pushSection(minutes, 'formatters.minutes');
  if (includeSeconds) {
    const seconds = Math.floor(duration / msInSecond);
    pushSection(seconds, 'formatters.seconds');
  }
  return sections.join(' ');
}

module.exports = {
  Entities,
  formatTable,
  formatMessageTable,
  formatEllipsis,
  formatDuration,
};
