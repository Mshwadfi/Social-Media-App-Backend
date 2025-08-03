const decayRate = 0.4;

export const calculatePostScore = (post, connectionDegree) => {
  const hoursSincePublished =
    (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60) || 0;

  const likes = post.likes?.length || 0;
  const degreePenalty = connectionDegree != null ? 0.1 * connectionDegree : 0;

  const rawScore =
    likes * (1 - decayRate) - hoursSincePublished * decayRate - degreePenalty;

  const score = Math.max(Math.ceil(rawScore), 0);
  return score;
};
