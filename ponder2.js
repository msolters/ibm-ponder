const N=3
const maxDepth = Math.pow(2, N)

// const syms = ['A', 'E', 'I', 'O', 'U']
const syms = ['A', 'B', 'C']

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

function getAnswer(answer) {
  if (answer.length < maxDepth) {
    for (sym of syms) {
      let answerClone = copy(answer)
      answerClone.push(sym)
      let [newAnswer, connected] = getAnswer(answerClone)
      if (connected) {
        return [newAnswer, connected]
      }
    }
    return [answer, false]
  } else {
    //  Validate answer using M
    console.log("validating", answer)
    return [answer, validateAnswer(answer, M)]
  }
  console.log('huh')
}

function validateAnswer(answer, neighborMatrix) {
  for (a in answer) {

    let _syms = getBlankSyms()
    _syms[answer[a]] = true
    for (m of neighborMatrix[a]) {
      _syms[answer[m]] = true
    }

    for (s of Object.keys(_syms)) {
      if (!_syms[s]) {
        console.log(`Fails at ${a}`)
        return false
      }
    }
  }
  return true
}

let [answer, ] = getAnswer([])
console.log(`\n`, answer)
