class Minesweeper
{
    constructor(xSize, ySize, initBombs)
    {
        this.xSize = xSize;
        this.ySize = ySize;
        this.bombCount = initBombs;

        this.gameBoard = document.querySelector('#gameboard');

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
                let newSpace = {bomb: false, revealed: false};
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
                newCol.setAttribute("class", "tile");
                if (this.gameState[col][row].bomb == true)
                {
                    newCol.innerHTML = "B";
                }
                else
                {
                    newCol.innerHTML = this.numberAdjacentBombs(col, row);
                }
                //let newTile = document.createElement("span");
                //newTile.setAttribute('class', 'tile');
                //newTile.setAttribute("data-x", col);
                //newTile.setAttribute("data-y", row);
                //newCol.appendChild(newTile);
                newRow.appendChild(newCol);
            }
            this.gameBoard.appendChild(newRow);
        }
    }
    
    // this is used to determine how many bombs are adjacent to a space
    numberAdjacentBombs(xSpace, ySpace)
    {
        let count = 0;
        
        console.log(xSpace, ySpace);
        // I could reduce the number of lines by injecting this directly into the for loops
        let colStart = Math.max(ySpace - 1, 0);
        let colEnd = Math.min(ySpace + 1, (this.ySize-1));
        let rowStart = Math.max(xSpace - 1, 0);
        let rowEnd = Math.min(xSpace + 1, (this.xSize-1));

        for (let col = colStart; col <= colEnd; col++)
        {
            for (let row = rowStart; row <= rowEnd; row++)
            {
                if (this.gameState[row][col].bomb == true)
                {
                    count++;
                }
            }
        }
        return count;
    }

}

document.addEventListener("DOMContentLoaded", function(event)
    {            
        currentGame = new Minesweeper(10,10,10);
        currentGame.setupGameBoard();
        
    }
    );

let currentGame;