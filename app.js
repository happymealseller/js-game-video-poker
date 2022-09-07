// GLOBAL ==================================================================================================
let mode = ""
let points = 15
let bet = 0
let hand = []
let handMemory = {}
let deck = []

// DOM HELPER ==============================================================================================
const createDiv = function (className) {
  const div = document.createElement("div")
  div.classList.add(className)  
  return div
}

const createImg = function (className, src, alt) {
  const img = document.createElement("img")
  img.classList.add(className) 
  img.setAttribute('src', src) 
  img.setAttribute('alt', alt) 
  return img
}

const createAudio = function (src) {
  const audio = document.createElement("audio")    
  audio.src = src  
  return audio
}

const createBtn = function (className, innerText, callback) {
  const btn = document.createElement("button")
  btn.classList.add(className) 
  btn.innerText = innerText
  btn.addEventListener("click", ()=>{audioClick.play()});
  btn.addEventListener("click", callback);
  return btn
}

const createProgressBar = function (className, value, maxValue) {
  const bar = document.createElement("progress");
  bar.classList.add(className)
  bar.setAttribute("value", value);
  bar.setAttribute("max", maxValue);
  return bar
}

const createText = function (target, text) {
  document.querySelector(target).innerHTML= text
}

const appendDiv = function (target, appendThis) {
  document.querySelector(target).appendChild(appendThis)  
}

// POKER CARD HELPER =======================================================================================
class Card {
  constructor(name, suit, rank, img) {
    this.name = name
    this.suit = suit
    this.rank = rank
    this.img = img     
  }

  setName() {
    if (this.rank === 11) {
      this.name = "jack"
    }
    else if (this.rank === 12) {
      this.name = "queen"
    }
    else if (this.rank === 13) {
      this.name = "king"
    }
    else if (this.rank === 14) {
      this.name = "ace"
    }
  }
}

const createCards = function(arrayElement) {
  for (let i = 2; i <= 14; i++) {
    let card = new Card (String(i), arrayElement, i , `${arrayElement}${i}.png`)  
    card.setName()
    deck.push(card)
  }
}

const createDeck = function() {
  const suits = ["diamond", "club", "heart", "spade"]
  suits.forEach(createCards)
}

const shuffleDeck = function(array) { 
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

const dealCards = function() {  
  for (let i = 1; i <=5; i++){
    const card = deck.pop()
    hand.push(card)
    document.querySelector(`.card${i}-image`).setAttribute('src', `./src/img/cards/${card.img}`) 
    document.querySelector(`.card${i}-image`).addEventListener("click", ()=>swapCards(i));  
  }  
}

const swapCards = function(index) {    
  if (hand.length === 0) return

    audioCardFlip.play()
  if (hand[index-1] !== "replace") {
    handMemory[index] = hand[index-1]    
    hand.splice(index-1, 1,"replace")
    document.querySelector(`.card${index}-image`).setAttribute('src', "./src/img/cards/back.png")    
  }   
  else {
    hand.splice(index-1, 1, handMemory[index])    
    document.querySelector(`.card${index}-image`).setAttribute('src', `./src/img/cards/${handMemory[index].img}`)
  }  
}

// POKER WIN CONDITION HELPER ==============================================================================
const getHandDetail= function (playerHand) {
  const [card1, card2 ,card3 , card4, card5] = playerHand
  const playerHandPower = [card1.rank, card2.rank ,card3.rank, card4.rank, card5.rank] 
  const playerHandDetail= {}  

  for (let i = 0; i < playerHandPower.length; i++) {
    playerHandDetail[playerHandPower[i]] = 0;
      for (let j = 0; j < playerHandPower.length; j++) { 
        if (playerHandPower[i] === playerHandPower[j]) {            
          playerHandDetail[playerHandPower[i]] += 1;   
        }
      }
  }  
  return playerHandDetail
}

const checkFlush = function (playerHand) {
  const [card1, card2 ,card3 , card4, card5] = playerHand
  const playerHandSuits = [card1.suit, card2.suit ,card3.suit, card4.suit, card5.suit]
  const uniqueSuits = new Set (playerHandSuits)  
  const uniqueSuitsCount = uniqueSuits.size

  if (uniqueSuitsCount === 1) {
    return true
  } else {
    return false
  }
}

const checkDuplicate = function (playerHandDetailValue) {  
  const playerHandDetail = Object.values(playerHandDetailValue)  
  const cardDuplicateTally = {
    duo: 0,
    tri: 0,
    quad: 0,
  } 

  for (let i = 0; i < playerHandDetail.length; i++) {
    if (playerHandDetail[i] === 2) {
      cardDuplicateTally.duo += 1      
    }

    if (playerHandDetail[i] === 3) {
      cardDuplicateTally.tri += 1
    }

    if (playerHandDetail[i] === 4) {
      cardDuplicateTally.quad += 1
    }    
  } 
  return cardDuplicateTally
}  

const checkStraight = function (playerHandDetailKey) {  
  const playerHandDetail = Object.keys(playerHandDetailKey)

  const straightCombination = []
  let straightCounter = 0
  const royalCombination = ["10", "11", "12", "13", "14"]
  let royalCounter = 0 

  for (let i = 0; i < playerHandDetail.length; i ++){
    straightCombination.push(String(Number(playerHandDetail[0]) + i))    
  }
  
  for (let i = 0; i < playerHandDetail.length; i ++){
    if (playerHandDetail[i] === royalCombination[i])  {  
      royalCounter ++      
    }
    
    if (playerHandDetail[i] === straightCombination[i])  {  
      straightCounter ++
    }    
  }  

  if (royalCounter === 5) {
    return "royal"
  }
  else if (straightCounter === 5) {
    return true
  } 
  else {
    return false
  }
}

const checkHighCard = function (playerHandDetail) {  
  const playerHandDetailKey = Object.keys(playerHandDetail) 

  for (const cardRank of playerHandDetailKey) {    
    if (Number(cardRank) >= 11 && playerHandDetail[cardRank] >= 2) {      
      return true
    }    
  }
  return false
}

const checkWin = function (hand) {
  const isFlush = (checkFlush(hand))  
  const isStraight = (checkStraight(getHandDetail(hand)))  
  const isDuplicate = (checkDuplicate(getHandDetail(hand)))  
  const has2HighCard = (checkHighCard(getHandDetail(hand)))
  

  if (isFlush === true && isStraight === "royal" ) {   
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 10)    
    createText(".message", `[MAX PAYOUT X10]<br>ROYAL FLUSH<br>YOU GAINED ${bet * 10} POINTS`)  
  } 

  else if (isFlush === true && isStraight === true ) {   
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 9)    
    createText(".message", `[PAYOUT X9]<br>STRAIGHT FLUSH<br>YOU GAINED ${bet * 9} POINTS`)   
  } 

  else if (isDuplicate.quad === 1) {    
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 8)    
    createText(".message", `[PAYOUT X8]<br>FOUR OF A KIND<br>YOU GAINED ${bet * 8} POINTS`)       
  } 
  
  else if (isDuplicate.tri === 1 && isDuplicate.duo === 1) {    
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 7)    
    createText(".message", `[PAYOUT X7]<br>FULL HOUSE<br>YOU GAINED ${bet * 7} POINTS`)   
  } 

  else if (isFlush === true) {  
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 6)    
    createText(".message", `[PAYOUT X6]<br>FLUSH<br>YOU GAINED ${bet * 6} POINTS`)  
  }

  else if (isStraight === true || isStraight === "royal") {    
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 5)    
    createText(".message", `[PAYOUT X5]<br>STRAIGHT<br>YOU GAINED ${bet * 5} POINTS`)  
  }

  else if (isDuplicate.tri === 1) {    
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 4)     
    createText(".message", `[PAYOUT X4]<br>THREE OF A KIND<br>YOU GAINED ${bet * 4} POINTS`)  
  }

  else if (isDuplicate.duo === 2) {    
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 3)        
    createText(".message", `[PAYOUT X3]<br>TWO PAIR<br>YOU GAINED ${bet * 3} POINTS`)  
  }

  else if (has2HighCard === true) {    
    audioWin.play()
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smile3.png")  
    points = points + (bet * 2)    
    createText(".message", `[PAYOUT X2]<br>JACKS OR BETTER<br>YOU GAINED ${bet * 2} POINTS`)  
  }

  else {
    audioLose.play() 
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/sad.png")  
    createText(".message", `OH NO, YOU LOST THIS ROUND!`)  
  }
}

// POKER POINTS HELPER =====================================================================================
const increaseBet = function() {
  if ((points - 5) < 0){
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/shock.png") 
    audioError.play()     
    createText(".message", "You can't increase your bet anymore!")
  } else {
    bet = bet + 5
    points = points - 5      
    createText(".point-area", `${points}`)
    createText(".bet-area", `${bet}`)    
    document.querySelector(".point-bar").setAttribute("value", points)
    document.querySelector(".bet-bar").setAttribute("value", bet)
  }
}

const decreaseBet = function() {
  if ((bet - 5) < 0){
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/shock.png")  
    audioError.play()    
    createText(".message", "You can't decrease your bet anymore!")
  } else {
    bet = bet - 5
    points = points + 5
    createText(".point-area", `${points}`)
    createText(".bet-area", `${bet}`)
    document.querySelector(".point-bar").setAttribute("value", points)
    document.querySelector(".bet-bar").setAttribute("value", bet)
  }
}

// CREATE AUDIO ============================================================================================
const audioHover = createAudio("./src/audio/hover.mp3")
const audioClick = createAudio("./src/audio/click.mp3")

const audioCardDeal = createAudio("./src/audio/card-deal.mp3")
const audioCardShuffle = createAudio("./src/audio/card-shuffle.mp3")
const audioCardFlip = createAudio("./src/audio/card-flip.wav")

const audioWin = createAudio("./src/audio/female-win.wav")

const audioLose = createAudio("./src/audio/female-lose.mp3")
audioLose.volume = 0.3; 

const audioError = createAudio("./src/audio/female-error.wav")
const audioAngry = createAudio("./src/audio/female-angry.wav")
const audioVoice1= createAudio("./src/audio/female-voice1.wav")

const audioWinJingle = createAudio("./src/audio/game-win.mp3")
audioWinJingle.volume = 0.2; 

const audioLoseJingle = createAudio("./src/audio/game-lose.mp3")
audioLoseJingle.volume = 0.2; 

const audioMenuBg = createAudio("./src/audio/menu-track.m4a")
audioMenuBg.volume = 0.3; 
audioMenuBg.loop = true;

const audioVisualBg = createAudio("./src/audio/visual-track.m4a")
audioVisualBg.volume = 0.1; 
audioVisualBg.loop = true;

const audioPokerBg = createAudio("./src/audio/poker-track.m4a")
audioPokerBg.volume = 0.1; 
audioPokerBg.loop = true;

// CREATE HTML =============================================================================================
const init = function(){ 
  document.querySelector(".init").addEventListener("click", initMenu);
}

const initPokerRules = function(){ 
  document.querySelector(".menu-container").remove()
  audioMenuBg.pause()
  appendDiv("body", createDiv("intro-container"))  
  appendDiv(".intro-container", createDiv("poker-info-text"))   
  appendDiv(".intro-container", createImg("winning-hands-image", "./src/img/winning-hands.png", "poker-hands-guide"))  
  appendDiv(".intro-container", createBtn("poker-info-btn", "RETURN", initMenu))
  createText(".poker-info-text", `
    [GENERAL] <br>
    • The most popular variation of Video poker is known as Jacks or Better • <br>  
    • The objective of 'Video Poker' is to get the best possible hand from the cards you are dealt • <br> 
    • You will be dealt an initial hand of five cards and then asked if you want to replace any of them • <br>
    • Cards you selected will then be replaced and the outcome of the round is determined • <br> 
      <br>
    [CARD RANKING]<br>  
    • Highest to lowest • <br>
    • ace, king, queen, jack, ten, nine, eight, seven, six, five, four, three, two • <br> 
      <br>
    [ACE RULES]<br>  
    • Ace is high, it cannot serve as the low value for a Straight or Straight Flush • <br>
    • ace, two, three, four, five • <br>
      <br>
    [HAND RANKING]<br>
    • Royal Flush: The Ace, King, Queen, Jack and ten of the same suit • <br>
    • Straight Flush: Five cards in rank order of the same suit • <br>                                              
    • Four of a Kind: Four cards of the same rank • <br>                                              
    • Full House: Three cards of one rank and a pair of another • <br>                                              
    • Flush: Five cards of the same suit • <br>                                              
    • Straight: Five cards in rank order of mixed suits • <br>                                             
    • Three of a Kind: Three cards of the same rank • <br>                                             
    • Two Pair: Two pairs of two different ranks • <br>                                             
    • Jacks or Better: A pair of Jacks, Queens, Kings or Aces • <br>
  `)
}

const initMenu = function(){
  document.querySelector(".intro-container").remove() 
  
  audioMenuBg.play()
  appendDiv("body", createDiv("menu-container"))
  appendDiv(".menu-container", createDiv("menu-main-title"))  
  appendDiv(".menu-container", createDiv("menu-sub-title"))  
  appendDiv(".menu-container", createBtn("menu-btn", "EASY MODE", ()=>{initVisual("Sayumi", "Hey you, transfer student!", sceneMain, "easy")}))
  appendDiv(".menu-container", createBtn("menu-btn", "NORMAL MODE", ()=>{initVisual("Sayumi", "Hey you, transfer student!", sceneMain, "normal")}))   
  appendDiv(".menu-container", createBtn("menu-btn", "POKER GUIDE", initPokerRules)) 
  createText(".menu-main-title", "COUNTING CARDS")
  createText(".menu-sub-title", "VIDEO POKER VN PROJECT")

  document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener('mouseover', ()=>{audioHover.play()});
  });
}

const initVisual = function(charName, firstMsg, scene, difficulty){
  mode = difficulty

  if (document.querySelector(".menu-container")) document.querySelector(".menu-container").remove()
  if (document.querySelector(".game-container")) document.querySelector(".game-container").remove()
  
  audioPokerBg.pause()
  audioMenuBg.pause()  

  if (scene === sceneWin) audioWinJingle.play()
  if (scene === sceneLose) audioLoseJingle.play()
  if (scene === sceneMain) audioVisualBg.play()
  appendDiv("body", createDiv("visual-container"))
  appendDiv(".visual-container", createDiv("character-area"))
  appendDiv(".character-area", createImg("character-image", "./src/img/sayumi/smile3.png", "character sprite"))
  appendDiv(".visual-container", createDiv("chatbox-area"))
  appendDiv(".chatbox-area", createDiv("chatbox-content"))
  appendDiv(".chatbox-content", createDiv("chatbox-name"))
  appendDiv(".chatbox-content", createDiv("chatbox-message"))
  document.querySelector(".chatbox-name").innerText= `${charName}:`
  document.querySelector(".chatbox-message").innerText = firstMsg
  document.querySelector(".chatbox-content").addEventListener("click", scene);  
}

const initGame = function(){  
  document.querySelector(".visual-container").remove()  
  
  audioVisualBg.pause()
  audioPokerBg.play()

  appendDiv("body", createDiv("game-container"))

  appendDiv(".game-container", createDiv("gc-game-area")) 
    appendDiv(".gc-game-area", createDiv("bar-area"))
      
      appendDiv(".bar-area", createDiv("point-title")) 
      appendDiv(".bar-area", createDiv("point-area"))        
      appendDiv(".bar-area", createProgressBar("point-bar", "0", "100")) 

      appendDiv(".bar-area", createDiv("bet-title")) 
      appendDiv(".bar-area", createDiv("bet-area"))        
      appendDiv(".bar-area", createProgressBar("bet-bar", "0", "100"))   
      
      createText(".point-title", `POINTS: `)
      createText(".bet-title", `BET: `)

    appendDiv(".gc-game-area", createDiv("message-area"))
      appendDiv(".message-area", createDiv("message"))
      document.querySelector(".message").classList.add("message-rules")  
      appendDiv(".message-area", createBtn("btn-poker", "OK!", phaseBet))  
    
    appendDiv(".gc-game-area", createDiv("character-area-sm"))
      appendDiv(".character-area-sm", createImg("character-image-sm", "./src/img/sayumi/smile2.png", "character sprite"))  

    appendDiv(".gc-game-area", createDiv("board-area"))
      appendDiv(".board-area", createDiv("card-area"))   
        appendDiv(".card-area", createImg("card1-image", "./src/img/cards/back.png", "card1"))
        appendDiv(".card-area", createImg("card2-image", "./src/img/cards/back.png", "card2"))
        appendDiv(".card-area", createImg("card3-image", "./src/img/cards/back.png", "card3"))
        appendDiv(".card-area", createImg("card4-image", "./src/img/cards/back.png", "card4"))
        appendDiv(".card-area", createImg("card5-image", "./src/img/cards/back.png", "card5")) 
       
  appendDiv(".gc-game-area", createDiv("control-area"))   
      appendDiv(".control-area", createDiv("button-area"))

  document.querySelector(".message").innerHTML = `
    [MAIN] <br>    
    • You start with 15 points. <br>
    • Accumulate 100 points to join the poker club. <br>
    • If you fall below 0 points, your lose your chance to join the club. <br>
    <br>
    [DIFFICULTY] <br>
     • Easy Mode: The deck is refreshed only when there are not enough cards. <br>
     • Normal Mode: The deck is refreshed at the end of each round. <br>
    <br>
    [PHASES] <br>
     • First place a bet using the '+' and '-' buttons. <br>
     • Once you're done, click on the start button. <br>    
     • Five cards will be dealt. <br>
     • You are allowed to swap out any of these five cards. <br>      
     • You can select cards you wish to swap by clicking them directly. <br>
     • You can unselect a selected card by clicking on it again. <br>
     • Once you're done, click on the confirm button. <br>
     • Selected cards are replaced and the outcome of the round is determined. <br>
     • Click on the end button, to end the current round and proceed to the next round. <br>  
   `
}

// CREATE HTML SCENES ======================================================================================
const sceneWin = function () {  
  const chatboxMessage = document.querySelector(".chatbox-message") 
  const characterSprite = document.querySelector(".character-image")

  audioClick.play()  

  if (chatboxMessage.innerText === "You have exceeded my expectations!") {    
    chatboxMessage.innerText = "Welcome to the club."      
    characterSprite.setAttribute('src', "./src/img/sayumi/smile3.png")    
  }  
  setTimeout(()=>{location.reload()}, 3500); 
}

const sceneLose = function () {
  const chatboxMessage = document.querySelector(".chatbox-message") 
  const characterSprite = document.querySelector(".character-image")

  audioClick.play()

  if (chatboxMessage.innerText === "Tsk! what a waste of my time.") {    
    chatboxMessage.innerText = "Got me all hyped up for nothing."      
    characterSprite.setAttribute('src', "./src/img/sayumi/sleepy.png")   
  }  
  setTimeout(()=>{location.reload()}, 3500); 
}

const sceneQuit = function(){
  const chatboxMessage = document.querySelector(".chatbox-message") 
  const characterSprite = document.querySelector(".character-image")
  
  audioAngry.play()
  characterSprite.setAttribute('src', "./src/img/sayumi/pout.png") 
  chatboxMessage.innerText = "Tsk, how rude of you!"
  setTimeout(()=>{location.reload()}, 3500); 
}

const sceneMain = function () {  
  const chatboxMessage = document.querySelector(".chatbox-message")   
  const characterSprite = document.querySelector(".character-image")

  audioClick.play() 
  
  try {
      if (chatboxMessage.innerText === "Hey you, transfer student!") {    
      chatboxMessage.innerText = "I heard that you are a math wizz."
      characterSprite.setAttribute('src', "./src/img/sayumi/smile2.png")      
    }
    else if (chatboxMessage.innerText === "I heard that you are a math wizz.") {    
      chatboxMessage.innerText = "Would you like to tryout for our poker club?"
      characterSprite.setAttribute('src', "./src/img/sayumi/smile2.png")     
    }
    else if (chatboxMessage.innerText === "Would you like to tryout for our poker club?" ) {       
      chatboxMessage.innerText = ""  
      characterSprite.setAttribute('src', "./src/img/sayumi/smile1.png")  
      const agree = createBtn("visual-btn", "Uhh... Sure I guess?", ()=>{initGame()})
      const disagree = createBtn("visual-btn", "No, don't bother me.", sceneQuit)
      chatboxMessage.appendChild(agree)
      chatboxMessage.appendChild(disagree)     
      
      document.querySelectorAll(".visual-btn").forEach(btn => {
        btn.addEventListener('mouseover', ()=>{audioHover.play()})
        btn.addEventListener('mouseover', ()=>{characterSprite.setAttribute('src', "./src/img/sayumi/smirk.png")})
      });
    }
  } catch (error) {
    console.warn = () => {};
  }  
}

// POKER GAME PHASE ========================================================================================
const phaseBet = function() {  
  if (document.querySelector(".btn-poker")) document.querySelector(".btn-poker").remove()
  document.querySelector(".button-area").remove() 
  document.querySelector(".message").classList.remove("message-rules")  
  
  createText(".message", "PLEASE PLACE YOUR BET")
  createText(".point-area", `${points}`)
  createText(".bet-area", `${bet}`)  
  document.querySelector(".point-bar").setAttribute("value", points) 
  document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smirk.png")  

  appendDiv(".control-area", createDiv("button-area"))  
  appendDiv(".button-area", createBtn("btn-poker", "+ 5", increaseBet))   
  appendDiv(".button-area", createBtn("btn-poker", "START", phaseSwap)) 
  appendDiv(".button-area", createBtn("btn-poker", "- 5", decreaseBet))     
}

const phaseSwap = function() {
  if (bet > 0) {
    document.querySelector(".button-area").remove() 
    document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/smirk.png") 
    
    appendDiv(".control-area", createDiv("button-area"))
    appendDiv(".button-area", createBtn("btn-poker", "CONFIRM", phaseResult))   

    if (deck.length <= 10) createDeck()
    shuffleDeck(deck)
    dealCards()
    createText(".message", `[DECK: ${deck.length} CARDS]<br><br>SELECT CARDS THAT YOU WISH TO REPLACE`) 
    } else {
      audioError.play()
      document.querySelector(".character-image-sm").setAttribute('src', "./src/img/sayumi/angry.png") 
      createText(".message", "You need to place a bet first!") 
    }
}

const phaseResult = function() {
  document.querySelector(".button-area").remove()   
  appendDiv(".control-area", createDiv("button-area"))
  appendDiv(".button-area", createBtn("btn-poker", "NEXT", phaseReset)) 

  for (const element of hand) {    
    if (element === "replace") {
      let index = hand.indexOf(element)      
      hand.splice(index,1,deck.pop())      
      document.querySelector(`.card${index+1}-image`).setAttribute('src', `./src/img/cards/${hand[index].img}`)
    }    
  }
  checkWin(hand)

  hand = []
  handMemory = {}

  bet = 0
  createText(".point-area", `${points}`)
  createText(".bet-area", `${bet}`)  
  document.querySelector(".point-bar").setAttribute("value", points)
  document.querySelector(".bet-bar").setAttribute("value", bet)  

  if (points <= 0) {
    document.querySelector(".btn-poker").innerText = "EXIT"
    createText(".point-area", "")
    createText(".bet-area", "") 
    createText(".message", `You have 0 points left!`)
  }
  else if (points >= 100) {    
    document.querySelector(".btn-poker").innerText = "CONTINUE"
    createText(".point-area", "")
    createText(".bet-area", "") 
    createText(".message", `You have accumulated ${points} points!`)
    document.querySelector(".point-bar").setAttribute("value", "100")
  } 
}

const phaseReset = function() {
  if (mode === "normal") deck = []  

  document.querySelector(".card-area").remove()
  appendDiv(".board-area", createDiv("card-area"))
  appendDiv(".card-area", createImg("card1-image", "./src/img/cards/back.png", "card1")) 
  appendDiv(".card-area", createImg("card2-image", "./src/img/cards/back.png", "card2")) 
  appendDiv(".card-area", createImg("card3-image", "./src/img/cards/back.png", "card3")) 
  appendDiv(".card-area", createImg("card4-image", "./src/img/cards/back.png", "card4")) 
  appendDiv(".card-area", createImg("card5-image", "./src/img/cards/back.png", "card5")) 

  if (points <= 0) {
    initVisual("Sayumi", "Tsk! what a waste of my time.", sceneLose)    
    document.querySelector(".character-image").setAttribute('src', "./src/img/sayumi/pout.png")
  }
  else if (points >= 100) {    
    initVisual("Sayumi", "You have exceeded my expectations!", sceneWin)     
    document.querySelector(".character-image").setAttribute('src', "./src/img/sayumi/shock.png") 
  } 
  else {
    phaseBet()
  }
}

// INIT GAME! ==============================================================================================
init()






