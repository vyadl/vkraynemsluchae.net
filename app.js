class Words {
  constructor(sentence = 'в крайнем случае нет') {
    this.initialWordState = {
      text: '',
      transformOrigin: '50% 50%',
      transform: 'none',
      left: 0,
      top: 0,
      color: '#fff',
      fontSize: '30px'
    };
    this.helpSign = document.querySelector('.j-help-sign');
    this.helpBlock = document.querySelector('.j-help');
    this.wrapperElement = document.querySelector('.j-wrapper');
    this.inputElement = document.querySelector('.j-sentence-input');
    this.sentenceForm = document.querySelector('.j-sentence-form');
    this.wordClickListenerDecorator = this.wordClickListenter.bind(this);
    this.initNewSentence(sentence);
  }

  initNewSentence(sentence, isNewSentence = false) {
    this.words = sentence.split(' ');
    this.stateHistory = [];
    this.currentState = {};
    this.currentHistoryIndex = -1;

    if (isNewSentence) {
      this.removeWordsElements();
    }

    this.createElements();
    this.wordsElements = document.querySelectorAll('.j-word');
    this.updateElementsConditions();
    this.pushCurrentStateToHistory();

    this.addListeners(isNewSentence);
  }

  updateWords(sentence) {
    this.words = sentence.split(' ');
    this.removeWordsElements();
    this.stateHistory = [];
  }

  // binds

  addListeners(isNewSentence = false) {
    this.bindWordClicks();

    if (!isNewSentence) {
      this.bindAllClicks();
      this.bindActionsForHistory();
      this.bindSentenceForm();
      this.bindHelp();
    }
  }

  bindAllClicks() {
    document.addEventListener('click', e => {
      this.hideHelp();
      this.initNewRandomState();
    });
  }

  bindWordClicks() {
    this.wordsElements.forEach(word => {
      word.addEventListener('click', this.wordClickListenerDecorator);
    });
  }

  wordClickListenter(e) {
    const newState = {};
    const word = e.target;
    const currentWordInState = this.currentState[word.getAttribute('data-id')];
    const transformOpts = this.calculateClickCoordinates(e, e.target);

    this.hideHelp();

    if (currentWordInState && currentWordInState.transform !== 'none') {
      newState[word.getAttribute('data-id')] = {
        transform: 'none',
      };
    } else {
      newState[word.getAttribute('data-id')] = {
        transformOrigin: `${transformOpts.transformOrigin.x}% ${transformOpts.transformOrigin.y}%`,
        transform: `rotate(${transformOpts.toTopRotate ? '-' : ''}90deg)`,
      };
    }

    this.updateCurrentState(newState);

    e.stopPropagation();
  }

  unbindWordClicks() {
    this.wordsElements.forEach(word => {
      word.removeEventListener('click', this.wordClickListenerDecorator);
    });
  }

  bindActionsForHistory() {
    document.addEventListener('keydown', e => {
      if (!this.sentenceForm.classList.contains('j-active')) {
        if (e.keyCode == 8) {
          this.setPreviousState();
        } else if (e.keyCode == 32) {
          this.setNextState();
        }
      }
    })
  }

  bindSentenceForm() {
    this.sentenceForm.addEventListener('submit', e => {
      e.preventDefault();

      if (this.inputElement.value) {
        this.initNewSentence(this.inputElement.value, true);
        this.closeForm();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.keyCode == 13 && !this.sentenceForm.classList.contains('j-active')) {
        this.openForm();
      }

      if (e.keyCode == 27 && this.sentenceForm.classList.contains('j-active')) {
        this.closeForm();
      }
    });

    document.querySelector('.j-close').addEventListener('click', e => this.closeForm());

    this.sentenceForm.addEventListener('click', e => {
      e.stopPropagation();
    });
  }

  bindHelp() {
    this.helpSign.addEventListener('click', e => {
      this.helpBlock.classList.toggle('g-hidden');
      this.helpSign.classList.toggle('active');

      e.stopPropagation();
    });
  }

  hideHelp() {
    if (this.helpSign.classList.contains('active')) {
      this.helpBlock.classList.add('g-hidden');
      this.helpSign.classList.remove('active');
    }
  }

  openForm() {
    this.sentenceForm.classList.add('j-active');
    this.sentenceForm.classList.remove('g-hidden');
    this.inputElement.focus();
  }

  closeForm() {
    this.inputElement.value = '';
    this.sentenceForm.classList.remove('j-active');
    this.sentenceForm.classList.add('g-hidden');
  }

  // state methods

  initNewRandomState() {
    const isSmallWidth = window.matchMedia('(max-width: 450px)').matches;
    const factor = isSmallWidth ? 1.2 : 2.7;
    const newState = {};

    this.wordsElements.forEach(item => {
      const left = `${Math.floor(Math.random() * factor * 100) - factor * 50}px`;
      const top = `${Math.floor(Math.random() * factor * 40) - factor * 20}px`;
      const fontSize = `${Math.floor(Math.random() * factor * 18) + 10}px`;
      const color = `rgb(
                ${Math.floor(Math.random() * 255)},
                ${Math.floor(Math.random() * 255)},
                ${Math.floor(Math.random() * 255)})`;
      newState[item.getAttribute('data-id')] = {
        top,
        left,
        fontSize,
        color,
        transform: 'none',
      }
    });

    this.updateCurrentState(newState);
  }

  updateCurrentState(newState = {}) {
    Object.keys(this.currentState).forEach(key => {
      this.currentState[key] = {
        ...this.currentState[key],
        ...newState[key]
      }
    });

    this.updateElementsConditions();
    this.pushCurrentStateToHistory();
  }

  // elements methods

  updateElementsConditions() {
    this.wordsElements.forEach(item => {
      const id = item.getAttribute('data-id');

      item.style.left = this.currentState[id].left;
      item.style.top = this.currentState[id].top;
      item.style.fontSize = this.currentState[id].fontSize;
      item.style.color = this.currentState[id].color;
      item.style.transform = this.currentState[id].transform;
      item.style.transformOrigin = this.currentState[id].transformOrigin;
    });
  }

  removeWordsElements() {
    this.wordsElements.forEach(item => {
      item.remove();
    });
    this.unbindWordClicks();
  }

  createElements() {
    const textElement = document.querySelector('.j-text');

    this.words.forEach((word, index) => {
      const element = document.createElement('span');

      element.innerHTML = word;
      element.classList.add('word');
      element.classList.add('j-word');
      element.setAttribute('data-id', index);

      textElement.appendChild(element);

      this.currentState[index] = JSON.parse(JSON.stringify(this.initialWordState));
      this.currentState[index].text = word;
    });
  }

  calculateClickCoordinates(event, element) {
    const elRect = element.getBoundingClientRect();
    const leftShiftForClick = event.clientX - elRect.left;
    const topShiftForClick = event.clientY - elRect.top;
    const leftShiftPercent = Math.floor(leftShiftForClick / element.offsetWidth * 100);
    const topShiftPercent = Math.floor(topShiftForClick / element.offsetHeight * 100);
    let isClickToTopPart = topShiftForClick / element.offsetHeight < 0.5;

    if (leftShiftPercent > 50) {
      isClickToTopPart = !isClickToTopPart;
    }

    return {
      transformOrigin: {
        x: leftShiftPercent,
        y: topShiftPercent
      },
      toTopRotate: isClickToTopPart
    };
  }

  // history methods

  pushCurrentStateToHistory() {
    this.stateHistory.push(JSON.parse(JSON.stringify(this.currentState)));
    this.currentHistoryIndex = this.stateHistory.length;
  }

  setPreviousState() {
    this.setStateFromHistory(this.currentHistoryIndex - 2);
  }

  setNextState() {
    this.setStateFromHistory(this.currentHistoryIndex);
  }

  setStateFromHistory(index) {
    if (this.stateHistory[index]) {
      this.currentState = JSON.parse(JSON.stringify((this.stateHistory[index])));
      this.updateElementsConditions();
      this.currentHistoryIndex = index + 1;
    }
  }
}

const WordsApp = new Words();
