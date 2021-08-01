const { UserInputError, AuthenticationError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/checkAuth");

module.exports = {
  Mutation: {
    async createComment(_, { postId, body }, context) {
      const user = checkAuth(context);

      try {
        if (body.trim() === "") {
          throw new UserInputError("Comment can not be empty", {
            errors: {
              body: "Comment can not be empty",
            },
          });
        }

        const post = await Post.findById(postId);

        if (post) {
          post.comments.unshift({
            body,
            username: user.username,
            createdAt: new Date().toISOString(),
          });
          await post.save();
          return post;
        }

        throw new UserInputError("Post not found");
      } catch (err) {
        throw new Error(err.message);
      }
    },

    async deleteComment(_, { postId, commentId }, context) {
      const user = checkAuth(context);

      const post = await Post.findById(postId);

      if (!post) {
        throw new UserInputError("Post not found");
      }

      const commentIndex = post.comments.findIndex(
        comment => comment.id === commentId
      );

      if (commentIndex === -1) {
        throw new UserInputError("Comment not found");
      }

      const comment = post.comments[commentIndex];

      if (comment.username !== user.username) {
        throw new AuthenticationError("Action not allowed");
      }

      post.comments.splice(commentIndex, 1);

      await post.save();
      return post;
    },
  },
};
