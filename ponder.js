const N=6
const maxDepth = Math.pow(2, N)

const syms = ['A', 'E', 'I', 'O', 'U']
// const syms = ['A', 'B', 'C']

function getNeighborMatrix() {
  let M = []
  for ( let k in Array(Math.pow(2, N)).fill() ) {
    let neighbors = []
    for ( let bit_idx in Array(N).fill() ) {
      neighbors.push( k ^ Math.pow(2, bit_idx) )
    }
    M.push(neighbors)
  }
  return M
}

const M = getNeighborMatrix()

function getBlankSyms() {
  let blankSyms = {}
  for ( let s of syms ) {
    blankSyms[s] = false
  }
  return blankSyms
}

function copy(arr) {
  let newArray = []
  for ( let a of arr ) {
    newArray.push(a)
  }
  return newArray
}

function getAnswer(depth, answer) {
  //  Pick a number and move on!
  var newAnswer
  var connected
  if (depth < maxDepth-1) {
    for (sym of syms) {
      let answerClone = copy(answer)
      answerClone.push(sym)
      let [_newAnswer, _connected] = getAnswer(depth+1, answerClone)
      if (_connected) {
        //  Everything from depth down is gucci, let's move up a level
        connected = _connected
        newAnswer = _newAnswer
        break
      }
    }
    if (!connected) {
      //  There are no good decisions below this depth, let's forget about
      //  this level.
      return [answer, false]
    }
  } else {
    newAnswer = copy(answer)
  }

  if (depth < 0) return [newAnswer, connected] // edge case of the initial function call, just return the answer

  //  Examine the neighbors at idx=depth, and determine if there is a connection
  //  to each type of symbol.
  let _syms = getBlankSyms()
  _syms[newAnswer[depth]] = true
  for (m of M[depth]) {
    _syms[newAnswer[m]] = true
  }
  // console.log(newAnswer)
  let _connected = true
  for (s of Object.keys(_syms)) {
    if (!_syms[s]) {
      _connected = false
      break
    }
  }
  // console.log(newAnswer, _connected)
  return [newAnswer, _connected]
}

let [answer, ] = getAnswer(-1, [])
console.log(`\n`, answer)
