// Super Tic Tac Toe!
// Just by manipulating HTML and CSS - no libraries or Canvas here.

// TODO:
// Implement each powerup
// Implement input
// Start frontend
// Remember that tsconfig.json is modified before committing (yes I did remember)
// Randomly select starting player
// Win/loss mechanism

type possiblePlayers = "x" | "o";
type boardData = (BoardObject | null)[][];
type possibleActivations = "standard" | "custom";
type rowColIndex = number[]; // should be of length 2

let gameContainer = document.querySelector("#game-container") as HTMLDivElement;
let gameFieldContainer = document.querySelector(
    "#game-field-container",
) as HTMLDivElement;

// Input bridge

class InputManager {
    private _isNewInput: boolean;
    private _newInputID: number | null;
    private _newInputrowCol: rowColIndex | null;

    constructor() {
        this._isNewInput = false;
        this._newInputID = null;
        this._newInputrowCol = null;
    }

    get isNewInput(): boolean {
        return this._isNewInput;
    }

    get newInputID(): number | null {
        return this._newInputID;
    }

    get newInputRowCol(): rowColIndex | null {
        return this._newInputrowCol;
    }

    registerInput(event: MouseEvent | PointerEvent, board: GameBoard): void {
        // Registers input event
        // to the class attributes. Automatically does mapIDToRowCol if needed.
        // Raises an error if the target does not have 'cell' in its classList.
        let target = event.target as HTMLDivElement; // fine, because it will always be that
        if (target.classList.contains("cell")) {
            this._isNewInput = true;
            this._newInputID = Number(target.id.replace("c", ""));
            this._newInputrowCol = this.mapIDToRowCol(
                Number(target.id.replace("c", "")),
                board,
            );
        } else {
            throw new Error("Input target is not cell!");
        }
    }

    markProcessedInput(): void {
        this._isNewInput = false;
        this._newInputID = null;
        this._newInputrowCol = null;
    }

    mapIDToRowCol(id: number, board: GameBoard): rowColIndex {
        // Function that takes an ID number (from the click callback)
        // and returns the equivalent row/column index for the same
        // cell in the passed GameBoard.
        // In almost all cases, you should use registerInput instead.
        let row = Math.floor(id / board.numColumns);
        let column = id % board.numColumns;
        return [row, column];
    }

    mapRowColtoID(cellIndex: rowColIndex, board: GameBoard) {
        // Takes in a RowCol, returns the ID.
        return cellIndex[0] * board.numColumns + cellIndex[1];
    }
}

// Backend

class TurnManager {
    currentPlayer: possiblePlayers;
    currentTurn: number;
    private _isNewTurn: boolean;

    constructor(startingPlayer: possiblePlayers) {
        this.currentPlayer = startingPlayer;
        this.currentTurn = 1;
        this._isNewTurn = true;
    }

    get isNewTurn(): boolean {
        return this._isNewTurn;
    }

    advanceTurn(): number {
        if (!this._isNewTurn) {
            // returns new turn number
            this.currentTurn++;
            this._isNewTurn = true;
            this.currentPlayer == "x"
                ? (this.currentPlayer = "o")
                : (this.currentPlayer = "x");
            return this.currentTurn;
        } else {
            throw new Error("Turn must be processed before advancing");
            // make sure to catch this
        }
    }

    markProcessedTurn(): void {
        this._isNewTurn = false;
    }
}

class BoardObject {
    // BoardObjects are the Xs and Os, as well as the powerups.
    // Shouldn't be constructed directly.
    canTakeover: boolean;

    constructor(canTakeover: boolean) {
        this.canTakeover = canTakeover;
    }
}

class PlayerBoardObject extends BoardObject {
    // player board objects s are the Xs and Os.
    player: possiblePlayers;

    constructor(player: possiblePlayers) {
        super(false);
        this.player = player;
    }
}

class PowerupBoardObject extends BoardObject {
    // base class for powerups; shouldn't be constructed directly
    activation: possibleActivations;
    id: number;

    constructor(
        activation: possibleActivations,
        id: number,
        canTakeover: boolean | undefined,
    ) {
        // conditionally super() and construct or raise an error
        switch (activation) {
            case "standard":
                super(true);
                this.activation = activation;
                this.id = id;
                break;
            case "custom":
                switch (canTakeover) {
                    case undefined:
                        throw new Error(
                            "Custom activation powerups must have a defined canTakeover value",
                        );
                    default:
                        super(canTakeover);
                        this.activation = activation;
                        this.id = id;
                        break;
                }
                break;
        }
    }

    customActivation(board: GameBoard): boolean {
        return false;
    } // derived powerups should override this if custom activating

    effect(prior: GameBoard): GameBoard {
        return prior;
    } // override when making new powerups

    // function to run every turn, returning either the player it's triggered by or null
}

class GameBoard {
    // Uses one-BoardObject-per-tile for simplicity. May change later.
    private _numRows: number; // integer
    private _numColumns: number; // also int
    data: boardData; // access with caution

    constructor(rows: number, cols: number) {
        this._numRows = rows;
        this._numColumns = cols;
        this.data = Array(this._numRows)
            .fill(null)
            .map(() => Array(this._numColumns).fill(null));
        /*
    For values of 3 and 3:
  [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]
    */
    }

    get numRows(): number {
        return this._numRows;
    }
    get numColumns(): number {
        return this._numColumns;
    }

    addRows(num: number): GameBoard {
        this._numRows += num;
        for (let i = 0; i < num; i++) {
            this.data.push(Array(this._numColumns).fill(null));
        }
        return this;
    }

    addColumns(num: number): GameBoard {
        this._numColumns += num; // modifying data inside the loop! no!
        let newData: boardData = [];
        this.data.forEach((row) => {
            let newRow = [...row];
            for (let i = 0; i < num; i++) {
                newRow.push(null);
            }
            newData.push(newRow);
        });
        this.data = newData;
        return this;
    }

    checkValidCell(cellIndex: rowColIndex): boolean {
        // Returns true if cell has nothing on it or can be overriden,
        // false if the thing on the square can't be overrriden
        let cell = this.data[cellIndex[0]][cellIndex[1]];
        if (cell == null) {
            return true;
        }
        return cell.canTakeover;
    }

    addBoardObject(
        cellIndex: rowColIndex,
        objToAdd: BoardObject,
        force: boolean = false,
    ): [GameBoard, ((prior: GameBoard) => GameBoard) | null] {
        // Replaces boardObject at cellIndex with objToAdd. Checks first with
        // GameBoard.checkValidCell, unless force = true.
        // If cell is occupied, does nothing (unless forced).
        // Returns the new board and the powerup effect function to execute, if applicable.
        if (force || this.checkValidCell(cellIndex)) {
            let priorCellOccupant = this.data[cellIndex[0]][cellIndex[1]];
            this.data[cellIndex[0]][cellIndex[1]] = objToAdd;
            if (priorCellOccupant instanceof PowerupBoardObject) {
                return [this, priorCellOccupant.effect];
            }
        }
        return [this, null];
    }

    removeBoardObject(
        cellIndex: rowColIndex,
        force: boolean = false,
    ): GameBoard {
        // Replaces boardObject at cellIndex with null. Checks first with
        // GameBoard.checkValidCell, unless force = true.
        if (!force && !this.checkValidCell(cellIndex)) {
            throw new Error(
                "Specified cell is occupied according to checkValidCell; specify force = true to bypass and replace this object",
            );
        }
        this.data[cellIndex[0]][cellIndex[1]] = null;
        return this;
    }

    display(
        rowColtoIDFn: (cellIndex: rowColIndex, board: GameBoard) => number,
    ): void {
        for (let [rowIndex, row] of this.data.entries()) {
            for (let [colIndex, entry] of row.entries()) {
                let cell = document.querySelector(
                    `#c${String(rowColtoIDFn([rowIndex, colIndex], this))}`,
                ) as HTMLDivElement;
                if (entry != null) {
                    if (entry instanceof PlayerBoardObject) {
                        if (entry.player == "x") {
                            cell.style.background = "green";
                        } else {
                            cell.style.background = "red";
                        }
                    } else if (entry instanceof PowerupBoardObject) {
                        cell.style.background = "yellow";
                    }
                }
            }
        }
    }
}

// Frontend

let inputManager = new InputManager();
let turnManager = new TurnManager("x");

let gameBoard = new GameBoard(3, 3);

for (let i = 0; i < 9; i++) {
    // temp
    let field = document.createElement("div");
    field.setAttribute("class", "cell");
    field.setAttribute("id", `c${String(i)}`);
    field.addEventListener("click", (event) => {
        inputManager.registerInput(event, gameBoard);
    });
    gameFieldContainer.append(field);
}

function process(): void {
    if (inputManager.isNewInput) {
        gameBoard.addBoardObject(
            inputManager.newInputRowCol as rowColIndex,
            new PlayerBoardObject(turnManager.currentPlayer),
        ); // process powerups here
        console.table(gameBoard.data);
        inputManager.markProcessedInput();
        turnManager.markProcessedTurn();
        turnManager.advanceTurn();
    }
    gameBoard.display(inputManager.mapRowColtoID);
    requestAnimationFrame(process);
}

requestAnimationFrame(process);
