const {Entities} = require('./Formatters');
const {messageLengthLimit} = require('./constants');

const SectionType = {
  Paragraph: 0,
  Line: 1,
  Word: 2,
};

class MessageDivider {
  divideContentIntoSections(content, sectionSize) {
    // first by paragraphs
    const sections = [];
    const paragraphs = content.split(/\n+\s*\n+/g);
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lastParagraph = paragraphIndex === paragraphs.length - 1;
      const paragraphEntity = lastParagraph ? '' : Entities.EmptyLine;
      if (paragraph.length + paragraphEntity.length <= sectionSize) {
        sections.push({
          content: paragraph,
          type: SectionType.Paragraph,
          entity: paragraphEntity,
        });
        return;
      }
      // divide the paragraph further into individual lines
      const lines = paragraph.split(/\n/g);
      lines.forEach((line, lineIndex) => {
        const lastLine = lineIndex === lines.length - 1;
        const lineEntity = lastLine ? paragraphEntity : Entities.NewLine;
        if (line.length + lineEntity <= sectionSize) {
          sections.push({
            content: line,
            type: SectionType.Line,
            entity: lineEntity,
          });
          return;
        }
        // line is too long it needs to be sliced into fragments
        const words = line.split(' ');
        words.forEach((word, wordIndex) => {
          const lastWord = wordIndex === words.length - 1;
          const wordEntity = lastWord ? lineEntity : ' ';
          sections.push({
            content: word,
            type: SectionType.Word,
            entity: wordEntity,
          });
        });
      });
    });
    return sections;
  }

  mergeSectionsIntoChunks(sections, chunkSize) {
    // try to merge as many of the sections of the same type as possible
    const chunks = [];
    let sectionIndex = 0;
    while (sectionIndex < sections.length) {
      const section = sections[sectionIndex];
      let subSectionIndex = sectionIndex;
      let subSectionContent = '';
      let previousEntity = '';
      while (subSectionIndex <= sections.length) {
        const subSection = sections[subSectionIndex];
        if (subSectionIndex === sections.length  // end of content
          || (subSection.type !== section.type && subSection.type !== SectionType.Word)  // section type is changing
          || subSectionContent.length + subSection.content.length + previousEntity.length > chunkSize // chunk overflow
        ) {
          chunks.push(subSectionContent);
          subSectionContent = '';
          break;
        }
        subSectionContent += previousEntity + subSection.content;
        previousEntity = subSection.entity;
        subSectionIndex++;
      }
      sectionIndex = subSectionIndex;
    }
    return chunks;
  }

  divideContentIntoChunks(content, chunkSize = messageLengthLimit) {
    if (content.length <= chunkSize) {
      return [content];
    }
    // divide content into sections like paragraphs and lines and then try to merged as many of the sections of the same type as possible
    const sections = this.divideContentIntoSections(content, chunkSize);
    return this.mergeSectionsIntoChunks(sections, chunkSize);
  }
}

module.exports = MessageDivider;
