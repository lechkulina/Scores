const {msInSecond, msInMinute, msInHour, msInDay, msInWeek, autoCompeteNameLimit} = require('./constants');

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

function padText(length, string) {
  return ' '.repeat(length - string.length) + `${string}`;
};

function formatTable({
  rows,
  columnsOrder: propsColumnsOrder,
  columnsLabels: propsColumnsLabels,
  roundWidthTo = defaultRoundWidthTo
}) {
  if (rows.length === 0) {
    return '';
  }
  // calculate columns widths, labels and order
  const columnsWidths = {};
  const columnsLabels = propsColumnsLabels ?? {};
  rows.forEach(row => {
    const names = Object.keys(row);
    names.forEach(name => {
      if (!columnsWidths[name]) {
        if (!columnsLabels[name]) {
          columnsLabels[name] = name;
        }
        // one is added to make sure that there is an exptra space on left side
        columnsWidths[name] = columnsLabels[name].length + 1;
      }
      const value = `${row[name]}`;
      columnsWidths[name] = Math.max(columnsWidths[name], value.length);
    });
  });
  Object.keys(columnsWidths).forEach(name => {
    columnsWidths[name] = Math.ceil(columnsWidths[name] / roundWidthTo) * roundWidthTo;
  });
  const columnsOrder = propsColumnsOrder ?? Object.keys(columnsWidths);
  // generate header section
  const sections = [];
  sections.push(
    columnsOrder
      .map(name => padText(columnsWidths[name], columnsLabels[name]))
      .join(` ${Entities.VerticalSeparator}`)
  );
  // generate horizontal separator
  sections.push(
    columnsOrder
      .map(name => Entities.HorizontalSeparator.repeat(columnsWidths[name]))
      .join(`${Entities.HorizontalSeparator}${Entities.JointSeparator}`)
  );
  // generate table content
  rows.forEach(row => {
    sections.push(
      columnsOrder
        .map(name => padText(columnsWidths[name], `${row[name]}`))
        .join(` ${Entities.VerticalSeparator}`)
    );
  });
  return `${Entities.NoFormat}${sections.join(Entities.NewLine)}${Entities.NoFormat}`;
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

function formatAutoCompleteName(value, name, limit = autoCompeteNameLimit) {
  return formatEllipsis(`${value} - ${name}`, limit);
}

function joinSections(sections, entity = Entities.NewLine) {
  return sections
    .filter(section => !!section)
    .join(entity);
}

module.exports = {
  Entities,
  formatTable,
  formatMessageTable,
  formatEllipsis,
  formatDuration,
  formatAutoCompleteName,
  joinSections,
};
