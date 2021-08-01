const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/checkAuth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) return post;

        throw new Error("Post not found");
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createPost(_, { body }, context) {
      const user = checkAuth(context);

      if (body.trim() === "") {
        throw new UserInputError("Post can not be empty");
      }

      const newPost = await Post.create({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      context.pubsub.publish("NEW_POST", { newPost });
      return newPost;
    },

    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);

        if (!post) {
          throw new AuthenticationError("Action not allowed");
        }

        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        }

        throw new AuthenticationError("Action not allowed, wrong user");
      } catch (err) {
        throw new Error(err.message);
      }
    },

    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);

      if (!post) {
        throw new UserInputError("Post not found");
      }

      const likeIndex = post.likes.findIndex(
        like => like.username === username
      );

      if (likeIndex === -1) {
        post.likes.push({ username, createdAt: new Date().toISOString() });
      } else {
        post.likes.splice(likeIndex, 1);
      }

      await post.save();
      return post;
    },
  },

  Subscription: {
    newPost: {
      subscribe: (_, __, context) => context.pubsub.asyncIterator("NEW_POST"),
    },
  },
};
