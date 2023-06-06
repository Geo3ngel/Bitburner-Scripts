/** @param {NS} ns */
export async function main(ns) {
    var contract = ns.args[0];
    var host = ns.args[1];
    var version = ns.args[2];
    var data = ns.codingcontract.getData(contract, host)
    var answer = null;

    answer = shortestPath(data)

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

// GPT Generated solution?
function shortestPath(grid) {
    const start = { x: 0, y: 0 };
    const target = { x: grid.length - 1, y: grid[0].length - 1 };

    const queue = [];
    queue.push({ ...start, path: '' });

    const visited = new Set();
    visited.add(start.x + '-' + start.y);

    while (queue.length > 0) {
        const { x, y, path } = queue.shift();

        if (x === target.x && y === target.y) {
            return path;
        }

        const neighbors = [
            { x: x - 1, y, direction: 'U' },
            { x: x + 1, y, direction: 'D' },
            { x, y: y - 1, direction: 'L' },
            { x, y: y + 1, direction: 'R' },
        ];

        for (const neighbor of neighbors) {
            const { x: nx, y: ny, direction } = neighbor;

            if (
                nx >= 0 &&
                nx < grid.length &&
                ny >= 0 &&
                ny < grid[0].length &&
                grid[nx][ny] === 0 &&
                !visited.has(nx + '-' + ny)
            ) {
                visited.add(nx + '-' + ny);
                queue.push({ x: nx, y: ny, path: path + direction });
            }
        }
    }

    return ''; // No path found
}