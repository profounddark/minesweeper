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

        this.initializeGameState();
        console.log(this.gameState);

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
                console.log("Adding bomb to " + bombX + ", " + bombY);
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

        this.addBombs(this.bombCount);

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

                this.gameState[col][row].tile = newCol;
                newRow.appendChild(newCol);
            }
            this.gameBoard.appendChild(newRow);
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

        targetTile.setAttribute("class", "tile reveal");

        targetTile.innerHTML = "";
        
        let newSpan = document.createElement("span");
        newSpan.setAttribute("class", "bomb" + adjBombs);
        newSpan.innerHTML = adjBombs;
        if (adjBombs == 0)
        {
            newSpan.style.visibility = "hidden";
        }        
        targetTile.appendChild(newSpan);
        
       

        //remove listener (for now)
        targetTile.removeEventListener("mousedown", handleTurn);
    }

    spaceCascade(tileX, tileY)
    {
        let cascadeArray = [];
        cascadeArray.push({x: tileX, y: tileY});
        while (cascadeArray.length > 0)
        {
            let currentXY = cascadeArray[0];

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
                        if (this.gameState[col][row].revealed == false)
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
        this.processMove(tileX, tileY)
    }

    processMove(tileX,tileY)
    {
        let targetTile = this.getTargetTile(tileX,tileY);

        console.log("Clicked " + tileX + ", " + tileY);
            
        if (this.isBomb(tileX, tileY))
        {
            targetTile.setAttribute("class", "tile bomb");
            targetTile.innerHTML = "<img src='./assets/bomb.png'>";
            /*
            let newSpan = document.createElement("span");
            newSpan.innerHTML = "!";
            targetTile.appendChild(newSpan);
            */
            this.loseScreen.setAttribute("class", "show");
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
            let newSpan = document.createElement("span");
            newSpan.innerHTML = "?";
            newSpan.style.visibility = "hidden";
            flaggedTile.appendChild(newSpan);
        }
        else
        {
            this.gameState[tileX][tileY].flagged = true;
            flaggedTile.innerHTML = "<img src='./assets/flag.png'>";
            /*
            let newSpan = document.createElement("span");
            newSpan.innerHTML = "<img src='./assets/flag.png'>";
            flaggedTile.appendChild(newSpan);
            */

        }
        console.log("flagged " + tileX + ", " + tileY);
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
        if ((this.bombCount + this.revealedTiles) == (this.xSize * this.ySize))
        {
            this.winScreen.setAttribute("class", "show");
        }
        console.log("Revealed " + this.revealedTiles + ", out of " + (this.xSize * this.ySize-this.bombCount) + " non-bomb tiles.");
    }
}

document.addEventListener("DOMContentLoaded", function(event)
    {            
        currentGame = new Minesweeper(10,10,10);
        currentGame.setupGameBoard();
        
    }
    );

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