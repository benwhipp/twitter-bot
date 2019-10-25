import {TrainingText} from './text-file.mjs';
export function markovMe() {

  let benBot = {
    firstWords: [],
    middleWords: {},
    lastWords:  []
  };

  //Splits the input text into paraagraphs separated by line breaks
  const paragraphs = TrainingText.split('\\');
  paragraphs.forEach(element => {

    //Splits each paragraph into an array of individual words separated by whitespace
    const filteredWords = element.replace('\\', '');
    const splitWords = filteredWords.split(' ');

    //Adds the first element in the splitWords array to the firstWords key of benBot
    benBot.firstWords.push({wordOne: splitWords[0], wordTwo: splitWords[1], wordThree: splitWords[2]});
    benBot.lastWords.push(splitWords[splitWords.length - 1]);

    
    for (let i = 0; i < splitWords.length; i++) {
      let currentWord = splitWords[i];

      if (currentWord.match(/[?.!]/)) {
        benBot.lastWords.push(currentWord);
      }

      //Checks for last words and if there is a word after the last word, pushes this word after the last word to the array of first words if true
      if (currentWord.match(/[?.!]/) && splitWords[i + 3]) {
        benBot.firstWords.push({wordZero: splitWords[i + 1], wordOne: splitWords[i + 2], wordTwo: splitWords[i + 3]});
      }

      //Checks if the word exists in middle words object, adds it if not
      if (!benBot.middleWords[currentWord]) {
        benBot.middleWords[currentWord] = []
      }

      //If there's a word after the given word in the array, push this to the middle words key as an element in the oppropriate array
      if (splitWords[i + 2]) {
        let wordsToBePushed = {wordOne: splitWords[i + 1], wordTwo: splitWords[i + 2]};
        benBot.middleWords[currentWord].push(wordsToBePushed);
      }
    }
  });

  const words = Object.keys(benBot.middleWords)
  let lastWord = '';
  let startingWord = benBot.firstWords[Math.floor(Math.random() * benBot.firstWords.length)];
  let wordToAddToResult = startingWord.wordZero + ' ' + startingWord.wordOne + ' ' + startingWord.wordTwo;
  let result = '';
  let word = startingWord;

  const generateChain = () => {
    do {
      result += wordToAddToResult + ' ';
      lastWord = word.wordTwo;
      let newWord = benBot.middleWords[lastWord][Math.floor(Math.random() * benBot.middleWords[lastWord].length)];
      if (!newWord /*|| !benBot.middleWords.hasOwnProperty(word)*/) {
        newWord = benBot.middleWords[lastWord][Math.floor(Math.random() * benBot.middleWords[lastWord].length)];
      }
      wordToAddToResult = newWord.wordOne + ' ' + newWord.wordTwo;
      word = newWord;
      
    //Tries to end the sentence on an end word. If it's too short, it'll keep adding words until the next end word or 265 characters is reached.
    } while (!benBot.lastWords.includes(lastWord));
  }

  do {
    result = '';
    generateChain();
  } while (result.length > 280)

  document.getElementById('markovResults').innerText = result;
  document.getElementById('button').addEventListener('click', markovMe);
}