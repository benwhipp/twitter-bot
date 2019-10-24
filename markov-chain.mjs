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
    benBot.firstWords.push(splitWords[0]);
    benBot.lastWords.push(splitWords[splitWords.length - 1]);

    
    for (let i = 0; i < splitWords.length; i++) {
      let currentWord = splitWords[i];

      if (currentWord.match(/[?.!]/)) {
        benBot.lastWords.push(currentWord);
      }

      //Checks for last words and if there is a word after the last word, pushes this word after the last word to the array of first words if true
      if (currentWord.match(/[?.!]/) && splitWords[i + 1]) {
        benBot.firstWords.push(splitWords[i + 1]);
      }

      //Checks if the word exists in middle words object, adds it if not
      if (!benBot.middleWords[currentWord]) {
        benBot.middleWords[currentWord] = []
      }

      //If there's a word after the given word in the array, push this to the middle words key as an element in the oppropriate array
      if (splitWords[i + 1]) {
        benBot.middleWords[currentWord].push(splitWords[i + 1]);
      }
    }
  });

  const words = Object.keys(benBot.middleWords)
  let lastWord = '';
  let startingWord = benBot.firstWords[Math.floor(Math.random() * benBot.firstWords.length)];
  let word = startingWord;
  let result = ''

  do {
    result += word + ' ';
    let newWord =  benBot.middleWords[word][Math.floor(Math.random() * benBot.middleWords[word].length)]
    lastWord = word;
    word = newWord;
    if (!word || !benBot.middleWords.hasOwnProperty(word)) {
      word = words[Math.floor(Math.random() * words.length)]
    } 
    console.log('word = ' + word)
  } while (!(benBot.lastWords.includes(lastWord) && result.length > 40) && result.length < 265);
  console.log(JSON.stringify(benBot.lastWords));

  document.getElementById('markovResults').innerText = result;
  document.getElementById('button').addEventListener('click', markovMe);
}