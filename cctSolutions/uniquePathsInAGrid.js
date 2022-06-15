export async function main(ns) {
    // Pass in the version using arguments!
    // version = ns.args[0]
    var contract = ns.args[0];
    var host = ns.args[1];
    var version = ns.args[2];
    var data = ns.codingcontract.getData(contract, host)
    var answer = null;
    switch (version) {
        case 1:
            ns.print("Case 1")
            answer = solveV1(ns, data[0], data[1])
            break
        case 2:
            ns.print("Case 1")
            break
    }
    if (answer != null) {
        var result = ns.codingcontract.attempt(answer, contract, host)
        ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
        ns.print(`Answer: ${answer}`)
        if (!result) {
            await ns.sleep(10000)
        }
    }
    ns.print(`Answer: ${answer}`)
}

// Javascript program to Print all possible paths from 
// top left to bottom right of a mXn matrix

function solveV1(ns, m, n) {
    // Driver Code
    // let maze = [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ] ];
    let maze = genMaze(m, n)
    ns.print(`Maze: ${maze} ${m}x${n}`)
    findPaths(maze, m, n)
    ns.print(`Paths: ${allPaths.length}`)
    return allPaths.length
}

function genMaze(m, n) {
    let matrix = []
    let iter = 0
    for (let x = 0; x < m; x++) {
        matrix.push([])
        for (let y = 0; y < n; y++) {
            matrix[x].push(iter)
            iter++
        }
    }
    return matrix
}

let allPaths = [];

function findPathsUtil(maze, m, n, i, j, path, index) {

    // If we reach the bottom of maze,
    // we can only move right
    if (i == m - 1) {
        for (let k = j; k < n; k++) {

            //path.append(maze[i][k])
            path[index + k - j] = maze[i][k];
        }

        // If we hit this block, it means one
        // path is completed. Add it to paths
        // list and print
        // document.write("[" + path[0] + ", ");
        // for(let z = 1; z < path.length - 1; z++)
        // {
        //     document.write(path[z] + ", ");
        // }
        // document.write(path[path.length - 1] + "]" + "<br>");
        allPaths.push(path);
        return;
    }

    // If we reach to the right most
    // corner, we can only move down
    if (j == n - 1) {
        for (let k = i; k < m; k++) {
            path[index + k - i] = maze[k][j];
        }

        // path.append(maze[j][k])
        // If we hit this block, it means one
        // path is completed. Add it to paths
        // list and print
        // document.write("[" + path[0] + ", ");
        // for(let z = 1; z < path.length - 1; z++)
        // {
        //     document.write(path[z] + ", ");
        // }
        // document.write(path[path.length - 1] + "]" + "<br>");
        allPaths.push(path);
        return;
    }

    // Add current element to the path list
    // path.append(maze[i][j])
    path[index] = maze[i][j];

    // Move down in y direction and call
    // findPathsUtil recursively
    findPathsUtil(maze, m, n, i + 1,
        j, path, index + 1);

    // Move down in y direction and
    // call findPathsUtil recursively
    findPathsUtil(maze, m, n, i, j + 1,
        path, index + 1);
}

function findPaths(maze, m, n) {
    let path = new Array(m + n - 1).fill(0);
    findPathsUtil(maze, m, n, 0, 0, path, 0);
}