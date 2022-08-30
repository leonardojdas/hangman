let categories = {
    list: [],
    selected: -1
};
const GAME_STATES = GameController.getConstants().GAME_STATES;
const GAME_MESSAGES = ['Game in progress!', "Game Over - You Win!", "Game Over - You lose!"];
let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "W", "Z"];

window.onload=function(){
    let url = "json/vocabularies.json";
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
        {
            loadObject(xhr.responseText);
            loadHtml();
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function loadObject(content)
{
    let temp = JSON.parse(content).vocabularies;

    temp.forEach(e => {
        categories.list.push({
            name: e.categoryName,
            words: e.words
        });
    });
} // end of loadObject

function loadHtml()
{
    document.querySelector("#inputNewGame").addEventListener("click", e => newGame());
} // end of loadHtml

function newGame()
{
    toogleButton("inputNewGame");
    document.querySelector("#icon-new-game").classList.remove("hidden");
    document.querySelector("#inputNewGame").classList.add("btn-new-game-selected");
    document.querySelector("#categoryContainer").classList.remove("hidden");

    let gameState = GameController.report().gameState;
    if(gameState === GAME_STATES.GAME_NOT_STARTED)
    {
        let html = "<div class='container-category'>";
        html += "<div class='title-category'>choose a category</div>";
        html += "<div class='categorie-row'>";
        for(let i = 0; i < categories.list.length; i++)
        {
            html += "<div id='cat-"+i+"'";
            html += "class='btn btn-category'>";
            html += categories.list[i].name;
            html += "<div id='icon-cat-"+i+"' class='icon-check hidden'>&#x2713;</div>";
            html += "</div>";
        }
        html += "</div>";
        
        html += "<div class=''>";
        html += "<div id='btnStartGame' class='btn btn-start disabled'>";
        html += "<h2>Go!</h2>";
        html += "<div id='icon-start-game' class='icon-check hidden'>&#x2713;</div>";
        html += "</div>";
        html += "</div>";
        html += "</div>";

        document.querySelector("#categoryContainer").innerHTML = html;

        for(let i = 0; i < categories.list.length; i++)
            document.querySelector("#cat-"+i).addEventListener("click", e => confirmCategory(i));
    }
    else
        resetGame();
} // end of newGame

function confirmCategory(category)
{
    let button = document.querySelector("#cat-"+category);
    document.querySelector("#icon-cat-"+category).classList.remove("hidden");
    if(categories.selected === -1)
    {
        let btnStartGame = document.querySelector("#btnStartGame");
        btnStartGame.addEventListener("click", function(){
            btnStartGame.classList.add("disabled");
            btnStartGame.classList.add("btn-start-selected");
            document.querySelector("#icon-start-game").classList.remove("hidden");
            document.querySelector("#alphabetContainer").classList.remove("hidden");
            document.querySelector("#draw").classList.add("draw");
            loadWord(categories.selected);
            toogleButton("category");
        });

        button.classList.add("btn-category-selected");
        categories.selected = category;
        toogleButton("btnStartGame");
    }
    else if(categories.selected === 99)
    {
        button.classList.add("btn-category-selected");
        categories.selected = category;
        toogleButton("btnStartGame");
    }
    else
    {
        document.querySelector("#cat-"+categories.selected).classList.remove("btn-category-selected");
        document.querySelector("#icon-cat-"+categories.selected).classList.add("hidden");
        
        button.classList.add("btn-category-selected");
        document.querySelector("#icon-cat-"+category).classList.remove("hidden");

        toogleButton("alphabet");
        categories.selected = category;
    }
} // end of confirmCategory

function toogleButton(btnName)
{
    if(btnName === "category")
    {
        let button = document.querySelector("#cat-0");
        if(button.classList.contains("disabled"))
        {
            for(let i = 0; i < categories.list.length; i++)
                document.querySelector("#cat-"+i).classList.remove("disabled");
        }
        else
        {
            for(let i = 0; i < categories.list.length; i++)
                document.querySelector("#cat-"+i).classList.add("disabled");
        }
    }
    else if(btnName === "alphabet")
    {
        for(let i = 0; i < alphabet.length; i++)
            document.querySelector("#alphabet-"+i).classList.add("disabled");
    }
    else
    {
        let button = document.querySelector("#"+btnName);
        if(button.classList.contains("disabled"))
            button.classList.remove("disabled");
        else
            button.classList.add("disabled");
    }
} // end of toogleButton

function loadWord(category)
{
    let max = categories.list[category].words.length;
    let random = Math.floor(Math.random() * max);
    let word = categories.list[category].words[random];

    GameController.newGame(word);

    loadAlphabet();
    loadHangman(word);
} // end of chooseWord

function loadAlphabet()
{
    let html = "<div class='alphabet-container'>";
    for(let i = 0; i < alphabet.length; i++)
    {
        if(i === 13)
        html += "<br>";
        html += "<div id='alphabet-"+i+"' class='btn alphabet'>";
        html += alphabet[i];
        html += "</div>";
    }
    html += "</div>";

    document.querySelector("#alphabetContainer").innerHTML = html;

    for(let i = 0; i < alphabet.length; i++)
        document.querySelector("#alphabet-"+i).addEventListener("click", e => checkGuess(i));
} // end of loadAlphabet

function checkGuess(index)
{
    let rep = GameController.report();
    if(rep.gameState === GAME_STATES.GAME_IN_PROGRESS && rep.guessesRemaining > 0)
    {
        let guess = alphabet[index];
        let guesses = rep.guessesRemaining;
        GameController.processLetter(guess);
        let guessesRemaining = GameController.report().guessesRemaining;
        let img = "<img src='images/"+guessesRemaining+".png' />"
        
        if(guesses === guessesRemaining)
        {
            document.querySelector("#alphabet-"+index).classList.add("correct-guess");
            fillLetter(guess);
        }
        else
        {
            document.querySelector("#alphabet-"+index).classList.add("wrong-guess");
            document.querySelector("#main").classList.add("bg-"+guessesRemaining);
            document.querySelector("#draw").innerHTML = img;
        }
    
        toogleButton("alphabet-"+index);
    }

    gameState = GameController.report().gameState;
    if(gameState !== GAME_STATES.GAME_IN_PROGRESS)
    {
        if(gameState === GAME_STATES.GAME_OVER_WIN)
            gameState = GAME_MESSAGES[1];
        else
            gameState = GAME_MESSAGES[2];

        toogleButton("alphabet");
        toogleButton("inputNewGame");
        document.querySelector("#inputNewGame").classList.remove("btn-new-game-selected");
        document.querySelector("#icon-new-game").classList.add("hidden");
    } else {
        gameState = GAME_MESSAGES[0];
    }

    let html = "<div class='message'>";
    html += gameState;
    html += "</div>";
    document.querySelector("#message").innerHTML = html;

    html = "<div class='guesses'>Guesses Remaining: ";
    html += GameController.report().guessesRemaining;
    html += "</div>";
    document.querySelector("#guesses").innerHTML = html;
} // end of checkGuess

function fillLetter(guess)
{
    let word = GameController.report().word.toLowerCase();
    guess = guess.toLowerCase();
    for(let i = 0; i < word.length; i++)
    {
        if(word.charAt(i) === guess)
            document.querySelector("#letter-"+i).innerHTML = guess.toUpperCase();
    }
} // end of updateGuesses

function loadHangman(word)
{
    let max = word.length;

    let html = "<div class='message'>";
    html += GAME_MESSAGES[0];
    html += "</div>";
    document.querySelector("#message").innerHTML = html;

    html = "<div class='guesses'>Guesses Remaining: ";
    html += GameController.report().guessesRemaining;
    html += "</div>";
    document.querySelector("#guesses").innerHTML = html;
    
    html = "";
    for(let i = 0; i < max; i++)
        html += "<div id='letter-"+i+"' class='letter'></div>";

    document.querySelector("#letters").innerHTML = html;

    document.querySelector("#draw").innerHTML = "<img src='images/6.png' />";
} // end of loadHangman

function resetGame()
{
    GameController.resetController();

    let classList = document.querySelector("#main").classList;
    for(let i = 0; i < 6; i++)
        classList.remove("bg-"+i);

    toogleButton("category");
    document.querySelector("#cat-"+categories.selected).classList.remove("btn-category-selected");
    document.querySelector("#icon-cat-"+categories.selected).classList.add("hidden");

    btnStartGame.classList.remove("btn-start-selected");
    document.querySelector("#icon-start-game").classList.add("hidden");

    document.querySelector("#draw").classList.remove("draw");

    document.querySelector("#alphabetContainer").classList.add("hidden");

    categories.selected = 99;

    document.querySelector("#message").innerHTML = "";
    document.querySelector("#draw").innerHTML = "";
    document.querySelector("#guesses").innerHTML = "";
    document.querySelector("#letters").innerHTML = "";
} // end of resetGame