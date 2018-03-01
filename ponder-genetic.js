const N=6
const maxScore = N*Math.pow(2, N)
const P=100    // solution population size
let D=5     // number of solutions replaced each cycle
let mutationChance = 0.07

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
function getBlankSyms() {
  let blankSyms = {}
  for ( let s of syms ) {
    blankSyms[s] = false
  }
  return blankSyms
}

const M = getNeighborMatrix()

function getRandomSymbol() {
  return syms[ Math.floor(Math.random() * syms.length) ]
}

function createRandomAnswer() {
  let randomAnswer = []
  for (let a of Array(Math.pow(2, N)).fill()) {
    randomAnswer.push(getRandomSymbol())
  }
  return randomAnswer
}

/**
 * Create P "flat" solutions
 * e.g. AAAAAA, BBBBB, ...
 */
function createFlatAnswers() {
  let solutions=[]
  let c=0
  for (let p=0; p<P; p++) {
    let symbol = syms[c++ % syms.length]
    solutions.push(Array(Math.pow(2, N)).fill(symbol))
  }
  return solutions
}

/**
 * Create P random solutions
 */
function createRandomAnswers() {
  let solutions=[]
  for (let p=0; p<P; p++) {
    solutions.push(createRandomAnswer())
  }
  return solutions
}

let lastMax
let staticGenerations = 0
function isMaxScoreDifferent(max) {
  if (max != lastMax) {
    staticGenerations = 0
    mutationChance = 0.07
    console.log(`${100*max}%`)
  } else {
    staticGenerations++
    // mutationChance += 0.00001
  }
  lastMax = max
}

function computeScoresAndLikelihood(solutions) {
  //  Score the current solutions
  let scores = []
  let scoreTotal = 0
  for (solution of solutions) {
    let score = scoreAnswer(solution, M)
    if (score == N*Math.pow(2, N)) {
      console.log(`We have a winner: `, solution)
      process.exit()
    }
    scoreTotal += score
    scores.push(score)
  }

  //  Assign scores to likelihood ranges
  let likelihood = []
  let offset = 0
  for (let s in scores) {
    offset += scores[s]/scoreTotal
    likelihood[s] = offset
  }
  return [scores, likelihood]
}

function getSolution() {
  //  Create initial random solutions
  let solutions = createRandomAnswers()
  // let solutions = createFlatAnswers()
  while(1) {
    var scores, likelihood

    // Create P new solutions
    let newSolutions = []
    for (let p=0; p<D; p++) {
      [scores, likelihood] = computeScoresAndLikelihood(solutions)

      // Pick 2 random solutions
      let s1 = solutions[getRandomSolution(likelihood)]
      let s2 = solutions[getRandomSolution(likelihood)]

      // Perform cross over
      let slicePoint = Math.floor(Math.random()*s1.length)
      let newSolution = []
      for (let k=0; k<s1.length; k++) {
        if (k < slicePoint) {
          newSolution.push(s1[k])
        } else {
          newSolution.push(s2[k])
        }

        // Apply random mutation
        if (Math.random() < mutationChance) {
          newSolution[k] = getRandomSymbol()
        }
      }

      //  Replace weakest solution
      let idx = getWeakestSolutionIndex(scores)
      solutions[idx] = newSolution
      // newSolutions.push(newSolution)
    }
    let _maxScore = Math.max(...scores)/maxScore
    isMaxScoreDifferent(_maxScore)
    if (staticGenerations > 0 && staticGenerations % 5000 == 0) {
      // replace the weakest solution with a random one
      console.log("replacing")
      let idx = getWeakestSolutionIndex(scores)
      solutions[idx] = getRandomSolution()
    }
    // solutions = newSolutions
  }
}

function getWeakestSolutionIndex(scores) {
  let min = maxScore
  let idx = 0
  for (let s in scores) {
    if (scores[s] < min) {
      min = scores[s]
      idx = s
    }
  }
  return idx
}

function getRandomSolution(likelihood) {
  let L = {}
  for (let t=0; t<10; t++) {
    let r = Math.random()
    for (l in likelihood) {
      if (r < likelihood[l]) {
        if (L[l]) {
          L[l]++
        } else {
          L[l] = 1
        }
      }
    }
  }
  let max = 0
  var idx
  for (let l of Object.keys(L)) {
    if (L[l] > max) {
      max = L[l]
      idx = l
    }
  }
  return idx
}

/**
 *  Is answer right or wrong?
 */
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

/**
 *  Returns a connectivity score.
 *  (A perfect connectivity score for an answer is n*(2^n))
 */
function scoreAnswer(answer, neighborMatrix) {
  let score = 0
  for (let a in answer) {
    let _syms = getBlankSyms()
    _syms[answer[a]] = true
    for (m of neighborMatrix[a]) {
      _syms[answer[m]] = true
    }
    let c = 0
    for (let s of Object.keys(_syms)) {
      if (_syms[s]) c++
    }
    score += c
  }
  return score
}

let s = getSolution()
console.log(validateAnswer(s, M))
