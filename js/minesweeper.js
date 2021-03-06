// It seems silly putting it up here, but...
let currentGame;

class Minesweeper
{
    constructor(xSize, ySize, initBombs)
    {
        this.xSize = xSize;
        this.ySize = ySize;
        console.log("board size: " + this.xSize + "x" + this.ySize);
        this.startBombs = initBombs;
        this.firstMove = true;
    
        this.bombCount = initBombs;
        this.clockTime = 0;
        this.intervalClock = null;
        this.revealedTiles = 0;

        this.gameBoard = document.querySelector('#gameboard');
        this.mineCounter = document.querySelector('#minecounter');
        this.clockBlock = document.querySelector('#timer');
        this.loseScreen = document.querySelector('#lose-screen');
        this.winScreen = document.querySelector('#win-screen');

        this.initializeGameState();


    }

    /* *********** HELPER FUNCTIONS - BEGIN *********** */

    isBomb(tileX, tileY)
    {
        return(this.gameState[tileX][tileY].bomb);
    }


    isRevealed(tileX, tileY)
    {
        return(this.gameState[tileX][tileY].revealed);
    }

    isFlagged(tileX, tileY)
    {
        return(this.gameState[tileX][tileY].flagged);
    }

    squareBounds(xSpace, ySpace)
    {
        let bounds = {
            colStart: Math.max((xSpace - 1), 0),
            colEnd: Math.min((xSpace + 1), (this.ySize-1)),
            rowStart: Math.max((ySpace - 1), 0),
            rowEnd: Math.min((ySpace + 1), (this.xSize-1))
        };
    
        return bounds;
    }

    updateMineCounter(numBombs)
    {
        let bombStr = numBombs.toString();
        this.mineCounter.innerHTML = bombStr.padStart(3, '0');
    }

    /* *********** HELPER FUNCTIONS - END *********** */

    // addBombs adds numberBombs mines to random empty spaces on the board
    addBombs(numberBombs)
    {
        let bombLoop = 0;

        while(bombLoop < numberBombs)
        {
            let bombX = Math.floor(Math.random() * this.xSize);
            let bombY = Math.floor(Math.random() * this.ySize);
            if (!this.isBomb(bombX, bombY))
            {
                this.gameState[bombX][bombY].bomb = true;

                bombLoop++;
            }
        } 
    }



    // initializes the internal game state (but not the displayed gameboard!)
    initializeGameState()
    {
        this.gameState = [];
        for (let column = 0; column < this.xSize; column++)
        {
            let newColumn = [];
            for (let row = 0; row < this.ySize; row++)
            {
                let newSpace = {bomb: false, revealed: false, flagged: false, tile: null};
                newColumn[row] = newSpace;
            }
            this.gameState[column] = newColumn;
        }

        this.addBombs(this.startBombs);
        this.updateMineCounter(this.startBombs);

    }

    // sets up the game board
    setupGameBoard()
    {
        this.gameBoard.innerHTML = "";
        let newStyle = "grid-template-columns: repeat(" + this.xSize + ", 1fr); grid-template-rows: repeat(" + this.ySize + ", 1fr);";
        this.gameBoard.setAttribute("style", newStyle);

        for (let row = 0; row < this.ySize; row++)
        {
            for (let col = 0; col < this.xSize; col++)
            {
                let newTile = document.createElement("div");
                if (((col+row) % 2) == 0)
                {
                    newTile.className = "tile";
                }
                else
                {
                    newTile.className = "tile odd";
                }

                newTile.setAttribute("data-x", col);
                newTile.setAttribute("data-y", row);
                
                let tileStyle = "grid-row: " + (row+1) + "; grid-column: " + (col+1) + ";";
                newTile.setAttribute("style", tileStyle);

                this.gameState[col][row].tile = newTile;
                this.gameBoard.appendChild(newTile);
            }
            
        }

        this.setUpTileListeners();
    }
    
    // this is used to determine how many bombs are adjacent to a space
    numberAdjacentBombs(xSpace, ySpace)
    {
        let count = 0;

        let bounds = this.squareBounds(xSpace, ySpace);

        for (let col = bounds.colStart; col <= bounds.colEnd; col++)
        {
            for (let row = bounds.rowStart; row <= bounds.rowEnd; row++)
            {
                if (this.isBomb(col, row))
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

    revealSpace(tileX, tileY, adjBombs)
    {
        let targetTile = this.getTargetTile(tileX, tileY);

        this.gameState[tileX][tileY].revealed = true;
        this.revealedTiles++;

        targetTile.className += " reveal bomb" + adjBombs;

        if (adjBombs != 0)
        {
            targetTile.innerHTML = adjBombs;
        }
        
        //remove listener (for now)
        targetTile.removeEventListener("mousedown", handleTurn);
    }

    revealBomb(tileX, tileY)
    {
        let targetTile = this.gameState[tileX][tileY].tile;   
        targetTile.innerHTML = "";
        targetTile.setAttribute("class", "tile bomb");   
    }

    revealAllBombs()
    {
        for (let col = 0; col < this.xSize; col++)
        {
            for (let row = 0; row < this.ySize; row++)
            {
                if (this.isBomb(col, row))
                {
                    this.revealBomb(col, row);
                }
            }
        }
    }

    spaceCascade(tileX, tileY)
    {
        let cascadeArray = [];
        cascadeArray.push({x: tileX, y: tileY});
        while (cascadeArray.length > 0)
        {
            let currentXY = cascadeArray[0];
            console.log(cascadeArray.length);

            // reveal the cell
            let bombCount = this.numberAdjacentBombs(currentXY.x, currentXY.y);
            if (!this.isRevealed(currentXY.x, currentXY.y))
            {
                this.revealSpace(currentXY.x, currentXY.y, bombCount);
            }

            if (bombCount == 0)
            {
                // add the adjacent cells
                let bounds = this.squareBounds(currentXY.x, currentXY.y);

                for (let col = bounds.colStart; col <= bounds.colEnd; col++)
                {
                    for (let row = bounds.rowStart; row <= bounds.rowEnd; row++)
                    {
                        if ((this.gameState[col][row].revealed == false))
                        {                            
                            cascadeArray.push({x: col, y: row});
                        }
                    }
                }
            }

            cascadeArray.shift();

           
        }
    }

    processFirstMove(tileX, tileY)
    {
        this.firstMove = false;
        let numbBombs = this.numberAdjacentBombs(tileX, tileY);

        // This conditional is weird. If there are >0 bombs in the starting 9 tiles,
        // it marks all of the spaces as bombs, adds bombs elsewhere, and then clears
        // all the spaces of bomb markers.
        if (numbBombs > 0)
        {
            let bounds = this.squareBounds(tileX, tileY);

            for (let col = bounds.colStart; col <= bounds.colEnd; col++)
            {
                for (let row = bounds.rowStart; row <= bounds.rowEnd; row++)
                {
                    this.gameState[col][row].bomb = true;
                }
            }
            
            this.addBombs(numbBombs);

            for (let col = bounds.colStart; col <= bounds.colEnd; col++)
            {
                for (let row = bounds.rowStart; row <= bounds.rowEnd; row++)
                {
                    this.gameState[col][row].bomb = false;
                }
            }
        }

        startClock();
        this.processMove(tileX, tileY)
    }
    
    processMove(tileX,tileY)
    {
        
        if (this.isBomb(tileX, tileY))
        {
            this.revealBomb(tileX, tileY);
            clearInterval(currentGame.intervalClock);
            this.loseScreen.setAttribute("class", "show");
            this.revealAllBombs();
        }
        else if (!this.isBomb(tileX, tileY) && !this.isRevealed(tileX, tileY))
        {
            let adjBombCount = this.numberAdjacentBombs(tileX, tileY);
            if (adjBombCount == 0)
            {
                this.spaceCascade(tileX, tileY);
            }
            else
            {
                this.revealSpace(tileX, tileY, adjBombCount);
            }
        }
    }

    flagTile(tileX, tileY)
    {
        let flaggedTile = this.getTargetTile(tileX, tileY);
        if (this.isFlagged(tileX, tileY))
        {
            this.gameState[tileX][tileY].flagged = false;
            flaggedTile.innerHTML = "";

            // increment the bomb counter
            this.bombCount++;
            this.updateMineCounter(this.bombCount);
        }
        else
        {
            this.gameState[tileX][tileY].flagged = true;

            let newFlag = document.createElement("img");
            newFlag.setAttribute("src", "./assets/flag.png");
            flaggedTile.appendChild(newFlag);

            // decrement hte bomb counter
            this.bombCount--;
            this.updateMineCounter(this.bombCount);
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
            tile.addEventListener("mousedown", handleTurn);
            // this disabled the contextmenu that normally comes up
            tile.addEventListener('contextmenu', (e) =>
            {
                e.preventDefault();
                return false;
            });

        }
    }

    winCheck()
    {
        if ((this.startBombs + this.revealedTiles) == (this.xSize * this.ySize))
        {
            clearInterval(currentGame.intervalClock);
            this.winScreen.setAttribute("class", "show");
        }
        console.log("Revealed " + this.revealedTiles + ", out of " + (this.xSize * this.ySize-this.startBombs) + " non-bomb tiles.");
    }
}

document.addEventListener("DOMContentLoaded", function(event)
    {            
        currentGame = new Minesweeper(10,10,15);
        currentGame.setupGameBoard();
        
    }
    );

/* *********** TIMER FUNCTIONS - BEGIN ********** */
// NOTE: SetInterval messes with "this", so I had to pull them out of the class

function updateClock()
{
    currentGame.clockTime++;
    let clockString = currentGame.clockTime.toString();
    currentGame.clockBlock.innerHTML = clockString.padStart(3, '0');
}
function startClock()
{
    currentGame.intervalClock = window.setInterval(updateClock, 1000);
}

/* *********** TIMER FUNCTIONS - END ************ */

function handleTurn(event)
{
    // get the X, Y from the space; I added the parseint because I had problems w/ stirngs
    let tileX = parseInt(event.currentTarget.getAttribute("data-x"));
    let tileY = parseInt(event.currentTarget.getAttribute("data-y"));
    if ((event.button == 0) && (!currentGame.isFlagged(tileX, tileY)))
    {
        if (currentGame.firstMove)
        {
            currentGame.processFirstMove(tileX, tileY);
        }
        else
        {
            currentGame.processMove(tileX, tileY);
        }
    }
    else if (event.button == 2)
    {
        currentGame.flagTile(tileX, tileY);
    }

    currentGame.winCheck();
}