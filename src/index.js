let depth = 0;

module.exports = function solveSudoku(matrix) {
  // your solution
  const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const sudoku = [];

  for(let row = 0; row < matrix.length; row++) {
    sudoku.push([]);
    for(let column = 0; column < matrix[row].length; column++) {
      if (matrix[row][column] === 0) {
        sudoku[row].push(new Set(DIGITS));
      } else {
        sudoku[row].push(matrix[row][column]);
      }
    }
  }

  removeWrongDigits(sudoku);
  placeNumbersDeterministically(sudoku);
  return bruteforce(sudoku);
}

function bruteforce(matrix) {
  
  if (isSolved(matrix)) {
    return matrix;
  }
  
  for(let row = 0; row < matrix.length; row++) {
    for(let column = 0; column < matrix[row].length; column++) {
      if (typeof matrix[row][column] !== 'number') {        
        for (let item of matrix[row][column]) {
          let cloned = cloneSudoku(matrix);
          cloned[row][column] = item;
          applyRestrictions(row, column, cloned);
          placeNumbersDeterministically(cloned);

          if(isSolved(cloned) || !isDeadEnd(cloned)) {
            result = bruteforce(cloned);
            if (result) {
              return result;
            }
          }  
        }
      }      
    }
  }

}

//for given number at [row, column] remove it from sets in corresponding blocks
function applyRestrictions(row, column, matrix) {
  //row
  for(let i = 0; i < matrix[row].length; i++) {
    if(typeof matrix[row][i] !== 'number') {
      matrix[row][i].delete(matrix[row][column])
    }
  }

  //col
  for(let i = 0; i < matrix.length; i++) {
    if(typeof matrix[i][column] !== 'number') {
      matrix[i][column].delete(matrix[row][column])
    }
  }

  //section
  const startCol = Math.floor(column / 3) * 3;
  const endCol = startCol + 3;
  const startRow = Math.floor(row / 3) * 3;
  const endRow = startRow + 3;

  for(let i = startRow; i < endRow; i++) {
    for(let j = startCol; j < endCol; j++) {
      if(typeof matrix[i][j] !== 'number') {
        matrix[i][j].delete(matrix[row][column])
      }
    }
  }
}

//checks if set element is unique (no other set in same block contains it)
function isUniqueFor(row, column, elem, matrix) {
  //row
  let uniqInRow = true;
  for(let i = 0; i < matrix[row].length; i++) {
    if(typeof matrix[row][i] !== 'number' && i !== column) {
      if(matrix[row][i].has(elem)) {
        uniqInRow = false;
      }
    }
  }

  //col
  let uniqInCol = true;
  for(let i = 0; i < matrix.length; i++) {
    if(typeof matrix[i][column] !== 'number' && i !== row) {
      if(matrix[i][column].has(elem)) {
        uniqInCol = false;
      }
    }
  }

  //section
  let uniqInSection = true;
  const startCol = Math.floor(column / 3) * 3;
  const endCol = startCol + 3;
  const startRow = Math.floor(row / 3) * 3;
  const endRow = startRow + 3;

  for(let i = startRow; i < endRow; i++) {
    for(let j = startCol; j < endCol; j++) {
      if(typeof matrix[i][j] !== 'number' && !(i === row && j === column)) {
        if(matrix[i][j].has(elem)) {
          uniqInSection = false;
        }
      }
    }
  }

  return uniqInCol || uniqInRow || uniqInSection;
}

//bypass matrix
function removeWrongDigits(matrix) {
  for(let row = 0; row < matrix.length; row++) {
    for(let column = 0; column < matrix[row].length; column++) {
      if (typeof matrix[row][column] === 'number') {
        applyRestrictions(row, column, matrix);
      }
    }
  }
}

//replace set with number if can be done
function placeNumbersDeterministically(matrix) {
  while (true) {
    let numberPlaced = false;
    //set contains only one digit
    for(let row = 0; row < matrix.length; row++) {
      for(let column = 0; column < matrix[row].length; column++) {
        if (typeof matrix[row][column] !== 'number' && matrix[row][column].size === 1) {
          numberPlaced = true;
          matrix[row][column] = [...matrix[row][column]][0];
          applyRestrictions(row, column, matrix);
        }
      }
    }

    //set contains digit unique for block(row, column or section)
    for(let row = 0; row < matrix.length; row++) {
      for(let column = 0; column < matrix[row].length; column++) {
        if (typeof matrix[row][column] !== 'number') {
          for(let elem of matrix[row][column]) {
            const uniq = isUniqueFor(row, column, elem, matrix);
            if (uniq) {
              numberPlaced = true;
              matrix[row][column] = elem;
              applyRestrictions(row, column, matrix);
            }
          }
        }
      }
    }

    if (!numberPlaced) {
      break;
    }
  }
}

function cloneSudoku(matrix) {
  const sudoku = [];

  for(let row = 0; row < matrix.length; row++) {
    sudoku.push([]);
    for(let column = 0; column < matrix[row].length; column++) {
      if (typeof matrix[row][column] !== 'number') {
        sudoku[row].push(new Set(matrix[row][column]));
      } else {
        sudoku[row].push(matrix[row][column]);
      }
    }
  }

  return sudoku;
}

function isSolved(matrix) {
  for(let row = 0; row < matrix.length; row++) {
    for(let column = 0; column < matrix[row].length; column++) {
      if (typeof matrix[row][column] !== 'number') {
        return false;
      }
    }
  }
  return true;
}

function isDeadEnd(matrix) {
  for(let row = 0; row < matrix.length; row++) {
    for(let column = 0; column < matrix[row].length; column++) {
      if (typeof matrix[row][column] !== 'number' && matrix[row][column].size === 0) {
        return true;
      }
    }
  }
  return false;
}