// Super Tic Tac Toe!
// Using only the HTML Canvas

// TODO: Implement a turn manager
// Implement each powerup
// Implement input

// const canvas = document.querySelector("#gameCanvas") as HTMLCanvasElement;
type possiblePlayers = "x" | "o";
type boardData = (BoardObject | null)[][];
type possibleActivations = "standard" | "custom";

// function draw() {}

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

    effect(board: GameBoard): GameBoard {
        return board;
    } // override when making new powerups

    // function to run every turn, returning either the player it's triggered by or null
}

class GameBoard {
    // Uses one-BoardObject-per-tile for simplicity. May change later.
    private _num_rows: number; // integer
    private _num_columns: number; // also int
    data: boardData; // access with caution

    constructor(rows: number, cols: number) {
        this._num_rows = rows;
        this._num_columns = cols;
        this.data = Array(this._num_rows).fill(
            Array(this._num_columns).fill(null),
        );
        /*
    For values of 3 and 3:
  [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]
    */
    }

    get num_rows(): number {
        return this._num_rows;
    }
    get num_columns(): number {
        return this._num_columns;
    }

    add_rows(num: number): GameBoard {
        this._num_rows += num;
        for (let i = 0; i < num; i++) {
            this.data.push(Array(this._num_columns).fill(null));
        }
        return this;
    }

    add_columns(num: number): GameBoard {
        this._num_columns += num; // modifying data inside the loop! no!
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
}

let gb = new GameBoard(3, 3);
gb.add_rows(5);
gb.add_columns(3);

console.table(gb.data);
