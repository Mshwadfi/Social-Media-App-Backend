const connection = require("../src/models/connection");
const User = require("../src/models/user");

const getUserConnections = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { error: "User not found" };
    const connections = await connection.find({
      $or: [{ user1: userId }, { user2: userId }],
    });

    const neighbours = connections.map((conn) => {
      return conn.user1.toString() === userId.toString()
        ? conn.user2
        : conn.user1;
    });
    return [...new Set(neighbours)].map((id) => id.toString());
  } catch (error) {
    return { error: "An error occurred while fetching connections" };
  }
};

// Bidirectional BFS to find shortest path between two users
const getConnectionDegreeBetweenUsers = async (
  userId1,
  userId2,
  maxDegree = 3
) => {
  try {
    const user1Str = userId1.toString();
    const user2Str = userId2.toString();
    const searchDepth = Math.ceil(maxDegree / 2);

    if (user1Str === user2Str) return 0;

    // start bfs from both sides: source and destination
    // i think we can find a solution using single map!

    let visitedFromStart = new Map([[user1Str, 0]]);
    let visitedFromEnd = new Map([[user2Str, 0]]);

    let queueStart = [{ id: user1Str, degree: 0 }];
    let queueEnd = [{ id: user2Str, degree: 0 }];

    // go both directions
    while (queueStart.length > 0 || queueEnd.length > 0) {
      if (queueStart.length > 0) {
        const { id, degree } = queueStart.shift();

        if (degree >= searchDepth) continue;

        const neighbours = await getUserConnections(id);
        if (neighbours.error) return null;

        for (let neighbour of neighbours) {
          // check if we met in the middle
          if (visitedFromEnd.has(neighbour)) {
            return degree + 1 + visitedFromEnd.get(neighbour);
          }

          if (!visitedFromStart.has(neighbour)) {
            visitedFromStart.set(neighbour, degree + 1);
            queueStart.push({ id: neighbour, degree: degree + 1 });
          }
        }
      }

      if (queueEnd.length > 0) {
        const { id, degree } = queueEnd.shift();

        if (degree >= searchDepth) continue;

        const neighbours = await getUserConnections(id);
        if (neighbours.error) return null;

        for (let neighbour of neighbours) {
          // check if we met in the middle
          if (visitedFromStart.has(neighbour)) {
            return degree + 1 + visitedFromStart.get(neighbour);
          }

          if (!visitedFromEnd.has(neighbour)) {
            visitedFromEnd.set(neighbour, degree + 1);
            queueEnd.push({ id: neighbour, degree: degree + 1 });
          }
        }
      }
    }

    // no connection found within maxDegree
    return null;
  } catch (error) {
    console.error("Error in getConnectionDegreeBetweenUsers:", error);
    return null;
  }
};

module.exports = {
  getUserConnections,
  getConnectionDegreeBetweenUsers,
};
