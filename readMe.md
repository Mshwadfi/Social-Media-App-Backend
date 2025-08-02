# Social Media Backend API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## Purpose 🎯

This repository documents my journey in mastering backend development by building a social media API with Node.js, Express, and MongoDB. Goals include:

- Deep understanding of RESTful API design
- Implementing robust authentication
- Mastering MongoDB database design
- Learning backend best practices
- Handling complex data relationships

## Project Description 📖

A complete backend API for a social media platform featuring user authentication, profile management, connections system, and post management.

## Tech Stack 💻

| Category       | Technologies                         |
| -------------- | ------------------------------------ |
| Runtime        | Node.js                              |
| Framework      | Express.js                           |
| Database       | MongoDB with Mongoose                |
| Authentication | JWT, bcryptjs                        |
| Validation     | Joi                                  |
| Security       | Helmet, CORS, rate limiting          |
| Testing        | Jest, Supertest                      |
| Documentation  | Swagger/OpenAPI                      |
| Other          | Winston (logging), dotenv (env vars) |

## API Documentation 📄

### Authentication 🔒

| Endpoint                | Method | Description             | Status         |
| ----------------------- | ------ | ----------------------- | -------------- |
| `/register`             | POST   | Register new user       | ✅ Done        |
| `/login`                | POST   | User login              | ✅ Done        |
| `/auth/refresh-token`   | POST   | Refresh access token    | ⬜ Not Started |
| `/logout`               | POST   | User logout             | ✅ Done        |
| `/auth/forgot-password` | POST   | Initiate password reset | ✅ Done        |
| `/auth/reset-password`  | POST   | Complete password reset | ✅ Done        |

### User Profile 👤

| Endpoint           | Method | Description                 | Status  |
| ------------------ | ------ | --------------------------- | ------- |
| `/profile`         | GET    | Get current user profile    | ✅ Done |
| `/profile/:userId` | GET    | Get user profile by ID      | ✅ Done |
| `/profile`         | PATCH  | Update current user profile | ✅ Done |
| `/change-password` | POST   | Change password             | ✅ Done |

### Connections 🤝

| Endpoint                               | Method | Description               | Status         |
| -------------------------------------- | ------ | ------------------------- | -------------- |
| `/request`                             | POST   | Send connection request   | ✅ Done        |
| `/users/me/requests/sent`              | GET    | Get sent requests         | ⬜ Not Started |
| `/users/me/requests/received`          | GET    | Get received requests     | ⬜ Not Started |
| `//request/:requestId/accept`          | POST   | Accept connection request | ✅ Done        |
| `/users/me/requests/:requestId/reject` | PUT    | Reject connection request | ✅ Done        |
| `/users/me/connections`                | GET    | Get all connections       | ⬜ Not Started |
| `/users/me/connections/:userId`        | DELETE | Remove connection         | ⬜ Not Started |

### Posts 📝

| Endpoint                  | Method | Description              | Status         |
| ------------------------- | ------ | ------------------------ | -------------- |
| `/posts`                  | POST   | Create new post          | ✅ Done        |
| `/posts/me`               | GET    | Get current user's posts | ⬜ Not Started |
| `/posts/feed`             | GET    | Get feed posts           | ✅ Done        |
| `/posts/:postId`          | GET    | Get specific post        | ⬜ Not Started |
| `/posts/:postId`          | PATCH  | Update a post            | ✅ Done        |
| `/posts/:postId`          | DELETE | Delete a post            | ✅ Done        |
| `/posts/:postId/like`     | POST   | Like/unlike a post       | ✅ Done        |
| `/posts/:postId/unlike`   | DELETE | Like/unlike a post       | ✅ Done        |
| `/posts/:postId/comment`  | POST   | Add comment to post      | ⬜ Not Started |
| `/posts/:postId/comments` | GET    | Get post comments        | ⬜ Not Started |

## Future Features 🔮

### Planned Enhancements

| Feature            | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| Status/Stories     | 24-hour disappearing content with views tracking             |
| Real-time Features | WebSocket implementation for notifications and online status |
| Enhanced Security  | Two-factor authentication and login activity tracking        |
| Media Handling     | Image/video upload with cloud storage integration            |
| Advanced Features  | Post scheduling, analytics, content recommendations          |
| Microservices      | Split into auth, user, and post services with API gateway    |

## Learning Goals 🧠

1. **Advanced MongoDB**:

   - Aggregation pipelines
   - Complex queries and indexing
   - Optimal data modeling

2. **Performance Optimization**:

   - Redis caching
   - Query optimization
   - Efficient pagination

3. **Production Practices**:

   - Comprehensive error handling
   - Logging and monitoring
   - CI/CD pipelines

4. **Security**:
   - Secure auth flows
   - Data validation
   - Rate limiting
