const noFormat = '```';
const newLine = '\n';

const verticalSeparator = '║';
const jointSeparator = '╬';
const horizontalSeparator = '═';

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
  )).join(` ${verticalSeparator}`);
  const separator = columnsOrder.map(name => (
    horizontalSeparator.repeat(columnsWidths[name])
  )).join(`${horizontalSeparator}${jointSeparator}`);
  const content = rows.map(row => (
    columnsOrder.map(name => {
      const value = row[name];
      return fixed(columnsWidths[name], `${value}`);
    }).join(` ${verticalSeparator}`)
  )).join(newLine);
  return [
    noFormat,
    header,
    separator,
    content,
    noFormat
  ].join(newLine);
}

function formatMessageTable({message, ...props}) {
  return `${message}${newLine}${formatTable(props)}`;
}

module.exports = {
  noFormat,
  newLine,
  formatTable,
  formatMessageTable,
};
