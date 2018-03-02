const N=6
const maxScore = N*Math.pow(2, N)
const P=50      // solution population size
const D=10       // number of solutions replaced each cycle
const mutationChanceDefault = 0.001
let mutationChance = mutationChanceDefault
let replacing = 0

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

function createFlatAnswer() {
  return Array(Math.pow(2, N)).fill(getRandomSymbol())
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
    replacing = 0
    mutationChance = mutationChanceDefault
    // console.log(`${100*max}%`)
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

  //  Compute the inverse likelihood, used for finding the weakest solutions
  let inverseLikelihood = []
  let inverseTotal = scores.reduce( (s, i) => {
    return s + Math.pow(i, -1)
  }, 0)
  inverseTotal = Math.pow(inverseTotal, -1)
  offset = 0
  for (let s in scores) {
    offset += inverseTotal/scores[s]
    inverseLikelihood.push(offset)
  }
  return [scores, likelihood, inverseLikelihood]
}

function getSolution() {
  //  Create initial random solutions
  let solutions = createRandomAnswers()
  // let solutions = createFlatAnswers()
  while(1) {
    var scores, likelihood, inverseLikelihood

    // Create P new solutions
    let newSolutions = []
    for (let p=0; p<D; p++) {
      [scores, likelihood, inverseLikelihood] = computeScoresAndLikelihood(solutions)

      // Pick 2 random solutions
      let s1_idx = getRandomSolution(likelihood)
      let s2_idx = getRandomSolution(likelihood)
      let s1 = solutions[s1_idx]
      let s2 = solutions[s2_idx]
      let new_s1 = []
      let new_s2 = []

      // Perform cross over
      let slicePoint = Math.floor(Math.random()*s1.length)
      for (let k=0; k<s1.length; k++) {
        if (k < slicePoint) {
          new_s1.push(s1[k])
          new_s2.push(s2[k])
        } else {
          new_s1.push(s2[k])
          new_s2.push(s1[k])
        }

        // Apply random mutation
        // if (Math.random() < mutationChance) {
        //   new_s1[k] = getRandomSymbol()
        // }
        // if (Math.random() < mutationChance) {
        //   new_s2[k] = getRandomSymbol()
        // }
      }

      //  Replace weakest solutions
      let [idx, idx2] = getWeakestSolutionIndex(scores)
      solutions[idx] = new_s1
      solutions[idx2] = new_s2
      // solutions[idx] = (Math.random() < 0.5) ? new_s1 : new_s2
      // solutions[getRandomSolution(inverseLikelihood)] = new_s1
      // solutions[getRandomSolution(inverseLikelihood)] = new_s2
      // newSolutions.push(newSolution)

      // Mutate
      for (let s of solutions) {
        for (let k in s) {
          if (Math.random() < mutationChance) {
            s[k] = getRandomSymbol()
          }
        }
      }
    }
    let _maxScore = Math.max(...scores)/maxScore
    isMaxScoreDifferent(_maxScore)
    if (staticGenerations > 0 && staticGenerations % 10 == 0) {
      // replace the weakest solution with a random one
      // let replacing = Math.floor(Math.random()*P)
      replacing++
      for (let k=0; k<Math.min(replacing, P); k++) {
        let m = Math.random()
        let idx = Math.floor(Math.random()*P)
        if (m < 0.25) {
          let p = Math.floor(Math.random()*solutions[idx].length)
          let left = solutions[idx].slice(0, p)
          let right = solutions[idx].slice(p, solutions[idx].length)
          let newSolution = right.concat(left)
          solutions[idx] = newSolution
        } else if (m < 0.5) {
          solutions[idx].reverse()
        } else if (m < 0.75){
          solutions[idx] = createRandomAnswer()
        } else {
          solutions[idx] = createFlatAnswer()
        }
      }
      // printSolutions(solutions)
    }
    // solutions = newSolutions
    console.log(`(${replacing}/${P}) ${100*_maxScore}%`)
    // printSolutions(solutions)
  }
}

function printSolutions(solutions) {
  for (let s of solutions) {
    let str = ''
    for (let sym of s) {
      str += sym
    }
    console.log(str)
  }
  console.log('\n')
}

function getWeakestSolutionIndex(scores) {
  let min = maxScore
  let idx = 0
  let idx2 = 0
  for (let s in scores) {
    if (scores[s] < min) {
      min = scores[s]
      idx2 = idx
      idx = s
    }
  }
  return [idx, idx2]
}

function getRandomSolution(likelihood, p=1) {
  let L = {}
  for (let t=0; t<p; t++) {
    let r = Math.random()
    // console.log(r, likelihood)
    for (l in likelihood) {
      if (r < likelihood[l]) {
        if (L[l]) {
          L[l]++
        } else {
          L[l] = 1
        }
        break
      }
    }
  }
  // console.log(L)
  let max = 0
  var idx = []
  for (let l of Object.keys(L)) {
    if (L[l] > max) {
      max = L[l]
      idx = [l]
    } else if (L[l] == max) {
      idx.push(l)
    }
  }
  return idx[Math.floor(Math.random()*idx.length)]
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
