/**
 * runtime DOM renderer
 * renders a mobiledoc to DOM
 *
 * input: mobiledoc
 * output: DOM
 */

const utils = {
  createElement(tagName) {
    return document.createElement(tagName);
  },
  appendChild(target, child) {
    target.appendChild(child);
  },
  createTextNode(text) {
    return document.createTextNode(text);
  }
};

function createElementFromMarkerType([tagName, attributes]=['', []]){
  let element = utils.createElement(tagName);
  attributes = attributes || [];

  for (let i=0,l=attributes.length; i<l; i=i+2) {
    let propName = attributes[i],
        propValue = attributes[i+1];
    element.setAttribute(propName, propValue);
  }
  return element;
}

export default class DOMRenderer {
  /**
   * @param mobiledoc
   * @param rootElement optional, defaults to an empty div
   * @return DOMNode
   */
  render({version, sections: sectionData}, rootElement=utils.createElement('div'), cards={}) {
    const [markerTypes, sections] = sectionData;
    this.root = rootElement;
    this.markerTypes = markerTypes;
    this.cards = cards;

    sections.forEach((section) => this.renderSection(section));

    return this.root;
  }

  renderSection(section) {
    const [type] = section;
    let rendered;
    switch (type) {
      case 1:
        rendered = this.renderMarkupSection(section);
        utils.appendChild(this.root, rendered);
        break;
      case 2:
        rendered = this.renderImageSection(section);
        utils.appendChild(this.root, rendered);
        break;
      case 10:
        rendered = this.renderCardSection(section);
        utils.appendChild(this.root, rendered);
        break;
      default:
        throw new Error('Unimplement renderer for type ' + type);
    }
  }

  renderImageSection([type, src]) {
    let element = utils.createElement('img');
    element.src = src;
    return element;
  }

  renderCardSection([type, name, payload]) {
    let card = this.cards[name];
    if (!card) {
      throw new Error(`Cannot render unknown card named ${name}`);
    }
    let element = utils.createElement('div');
    card.display.setup(element, {}, {name}, payload);
    return element;
  }

  renderMarkupSection([type, tagName, markers]) {
    let element = utils.createElement(tagName);
    let elements = [element];
    let currentElement = element;

    for (let i=0, l=markers.length; i<l; i++) {
      let marker = markers[i];
      let [openTypes, closeTypes, text] = marker;

      for (let j=0, m=openTypes.length; j<m; j++) {
        let markerType = this.markerTypes[openTypes[j]];
        let openedElement = createElementFromMarkerType(markerType);
        utils.appendChild(currentElement, openedElement);
        elements.push(openedElement);
        currentElement = openedElement;
      }

      utils.appendChild(currentElement, utils.createTextNode(text));

      for (let j=0, m=closeTypes; j<m; j++) {
        elements.pop();
        currentElement = elements[elements.length - 1];
      }
    }

    return element;
  }
}
