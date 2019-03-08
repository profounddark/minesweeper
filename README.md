# Minesweeper

An attempt at creating the classic game Minesweeper in HTML5/CSS/JS. The intent of this project is to implement a basic version of Minesweeper in JavaScript with HTML and CSS. The basic game is similar to those available with many operating systems and for free on the internet.

The goal of Minesweeper is to reveal (click on) all of the spaces on the board that DO NOT contain a mine. Revealing a mine is normally considered a failure and ends the game as a loss for the player.

## First Playable Prototype

The first playable prototype will feature a fixed size game board of 10x10 squares. A start button will start a new game, randomizing the location of mines throughout the board. When a player clicks one of the squares, it will be either be revealed to be a mine or be empty. If the space contains a mine, that player has lost. If the the space does not contain a mine, it will reveal a number indicating how many adjacent spaces (orthogonally and diagonally) contain a mine. For example, if the player clicks on a space that is adjacent to two mines, the space will show a 2 (two). The game ends when one of two events occurs: the player reveals a mine; or the player reveals all spaces except those that contain a mine.

Similar to how the [https://github.com/profounddark/wats3020-browser-game](WATS 3020 TicTacToe) assignment organized the game of TicTacToe, this implementation of MineSweeper will have a class representing the entire game. A two-dimensional array will represent the game board. The board will need to store whether a mine is present in the space (added when the board is created). There may be some prudence in also storing whether or not the space has been revealed by the player or the number of adjacent bombs. There are reasons for either implementation that will be considered throughout the development. The Game class will also have (at least) methods for revealing squares on the board.
