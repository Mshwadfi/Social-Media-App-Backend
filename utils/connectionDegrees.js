const connection = require("../src/models/connection");
const User = require("../src/models/user");

const getUserConnections = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { error: "User not found" };
    const connections = await connection.find({
      $or: [{ user1: userId }, { user2: userId }],
    });

    const nieghbours = connections.map((conn) => {
      return conn.user1.toString() === userId.toString()
        ? conn.user2
        : conn.user1;
    });
    return [...new Set(nieghbours)].map((id) => id.toString());
  } catch (error) {
    return { error: "An error occurred while fetching connections" };
  }
};

// get connections degree
const getConnectionsDegree = async (userId, maxDegree = 3) => {
  try {
    let visited = new Set([userId.toString()]);
    let queue = [{ id: userId, degree: 0 }];
    let connectionDegrees = {};
    while (queue.length > 0) {
      let { id, degree } = queue.shift();
      if (degree >= maxDegree) continue;

      const nieghbours = await getUserConnections(id);
      if (nieghbours.error) return { error: nieghbours.error };

      for (let neighbour of nieghbours) {
        if (!visited.has(neighbour) && neighbour !== userId.toString()) {
          visited.add(neighbour);
          queue.push({ id: neighbour, degree: degree + 1 });
          if (!connectionDegrees[degree + 1]) {
            connectionDegrees[degree + 1] = [];
          }
          connectionDegrees[degree + 1].push(neighbour);
        }
      }
    }
    return connectionDegrees;
  } catch (error) {
    return { error: "An error occurred while fetching connections degree" };
  }
};
module.exports = { getUserConnections, getConnectionsDegree };
