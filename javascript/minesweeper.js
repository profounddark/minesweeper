// It seems silly putting it up here, but...
let currentGame;

class Minesweeper
{
    constructor(xSize, ySize, initBombs)
    {
        this.xSize = xSize;
        this.ySize = ySize;
        console.log("board size: " + this.xSize + "x" + this.ySize);
        this.bombCount = initBombs;
        this.firstMove = true;
    
        this.revealedTiles = 0;

        this.gameBoard = document.querySelector('#gameboard');
        this.loseScreen = document.querySelector('#lose-screen');
        this.winScreen = document.querySelector('#win-screen');

        this.gameState = this.initializeGameState();
        console.log(this.gameState);

    }

    // initializes the internal game state (but not the board!)
    initializeGameState()
    {
        let tempBoard = [];
        for (let column = 0; column < this.xSize; column++)
        {
            let newColumn = [];
            for (let row = 0; row < this.ySize; row++)
            {
                let newSpace = {bomb: false, revealed: false, tile: null};
                newColumn[row] = newSpace;
            }
            tempBoard[column] = newColumn;
        }

        let bombLoop = 0;

        while(bombLoop < this.bombCount)
        {
            let bombX = Math.floor(Math.random() * this.xSize);
            let bombY = Math.floor(Math.random() * this.ySize);
            if (tempBoard[bombX][bombY].bomb == false)
            {
                tempBoard[bombX][bombY].bomb = true;
                bombLoop++;
            }
        }
        return tempBoard;    
    }

    // sets up the game board
    setupGameBoard()
    {
        this.gameBoard.innerHTML = "";

        for (let row = 0; row < this.xSize; row++)
        {
            let newRow = document.createElement("div");
            newRow.setAttribute("class", "row");

            for (let col = 0; col < this.ySize; col++)
            {
                let newCol = document.createElement("div");
                newCol.setAttribute("class", "tile hidden");
                newCol.setAttribute("data-x", col);
                newCol.setAttribute("data-y", row);
                
                // I put this in just so the DIV size will be correct later
                let newSpan = document.createElement("span");
                newSpan.innerHTML = "?";
                newSpan.style.visibility = "hidden";
                
                newCol.appendChild(newSpan);
                this.gameState[col][row].tile = newCol;
                newRow.appendChild(newCol);
            }
            this.gameBoard.appendChild(newRow);
        }

        this.setUpTileListeners();
    }

    isBomb(tileX, tileY)
    {
        return(this.gameState[tileX][tileY].bomb);
    }


    isRevealed(tileX, tileY)
    {
        return(this.gameState[tileX][tileY].bomb);
    }



    
    // this is used to determine how many bombs are adjacent to a space
    numberAdjacentBombs(xSpace, ySpace)
    {
        let count = 0;
        
        
        // I could reduce the number of lines by injecting this directly into the for loops
        let colStart = Math.max((ySpace - 1), 0);
        let colEnd = Math.min((ySpace + 1), (this.ySize-1));
        let rowStart = Math.max((xSpace - 1), 0);
        let rowEnd = Math.min((xSpace + 1), (this.xSize-1));


        for (let col = colStart; col <= colEnd; col++)
        {
            for (let row = rowStart; row <= rowEnd; row++)
            {
                if (this.isBomb(row, col))
                {
                    count++;
                }
            }
        }
        return count;
    }

    getTargetTile(x, y)
    {
        return (this.gameState[x][y].tile);
    }

    revealSpace(tileX, tileY)
    {
        let targetTile = this.getTargetTile(tileX, tileY);

        this.gameState[tileX][tileY].revealed = true;
        this.revealedTiles++;

        targetTile.setAttribute("class", "tile reveal");
        
        let adjBombs = this.numberAdjacentBombs(tileX, tileY);
        
        // TODO: reveal more tiles if adjacent bombs is 0
        if (adjBombs == 0)
        {

        }
        else if (adjBombs != 0)
        {
            targetTile.innerHTML = "";
            let newSpan = document.createElement("span");
            newSpan.innerHTML = adjBombs;
            
            targetTile.appendChild(newSpan);
        }

        //remove listener (for now)
        event.target.removeEventListener("click", handleTurn);
    }

    processMove(tileX,tileY)
    {
        let targetTile = this.getTargetTile(tileX,tileY);

        console.log("Clicked " + tileX + ", " + tileY);
            
        if (this.isBomb(tileX, tileY))
        {
            targetTile.setAttribute("class", "tile bomb");
            targetTile.innerHTML = "";
            let newSpan = document.createElement("span");
            newSpan.innerHTML = "B";
            targetTile.appendChild(newSpan);
            this.loseScreen.setAttribute("class", "show");
        }
        else if (!this.isBomb(tileX, tileY) && !this.isRevealed(tileX, tileY))
        {
            this.revealSpace(tileX, tileY);
        }
    }

    setUpTileListeners()
    {
        // This method sets up event listeners for tiles. It is called when we
        // start a new game. It must find all the tiles and apply event listeners
        // to them.
        let tileElements = document.querySelectorAll(".tile");
        for (let tile of tileElements)
        {
            tile.addEventListener("click", handleTurn);
        }
    }

    winCheck()
    {
        if ((this.bombCount + this.revealedTiles) == (this.xSize * this.ySize))
        {
            this.winScreen.setAttribute("class", "show");
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event)
    {            
        currentGame = new Minesweeper(5,5,5);
        currentGame.setupGameBoard();
        
    }
    );

function handleTurn(event)
{
    // get the X, Y from the space; I added the parseint because I had problems w/ stirngs
    let tileX = parseInt(event.target.getAttribute("data-x"));
    let tileY = parseInt(event.target.getAttribute("data-y"));
    currentGame.processMove(tileX, tileY);
    currentGame.winCheck();
}