const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect(
  "mongodb+srv://admin-susan:Test123@cluster0.wdmgube.mongodb.net/blog"
);

const postsSchema = new mongoose.Schema({
  title: String,
  body: String,
});

const Post = mongoose.model("post", postsSchema);

app.get("/", function (req, res) {
  Post.find()
    .then((foundPosts) => {
      res.render("home", {
        homeStartText: homeStartingContent,
        posts: foundPosts,
      });
    })
    .catch((err) => {
      console.log("An error ocurred rendering the posts: " + err);
    });
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutText: aboutContent,
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    contactText: contactContent,
  });
});

app.get("/compose", function (req, res) {
  res.render("compose", {
    headerText: "Compose",
    buttonText: "Publish",
    postName: "",
    postContent: "",
    postId: null,
  });
});

app.get("/update/:postID", function (req, res) {
  const updateID = req.params.postID;

  Post.findById(updateID)
    .then((foundPost) => {
      res.render("compose", {
        headerText: "Edit",
        buttonText: "Apply",
        postName: foundPost.title,
        postContent: foundPost.body,
        postId: updateID,
      });
      console.log(foundPost);
    })
    .catch(
      (err) =>
        "An error ocurred finding the post with the requested update ID: " + err
    );
});

//********Expres routing parameters********
app.get("/posts/:topic", function (req, res) {
  //.lowerCase()  = Converts a string, as space separated words, to lower case.
  //const requestedTitle = _.lowerCase(req.params.topic);

  const requestedID = req.params.topic;

  Post.findById(requestedID)
    .then((foundPost) => {
      res.render("post", { post: foundPost });
    })
    .catch((err) => {
      console.log("An error ocurred rendering the post by its ID: " + err);
    });

  //   posts.forEach(function(post) {
  //
  //     const storedTitle = _.lowerCase(post.title);
  //
  //     if (storedTitle === requestedTitle) {
  //       res.render("post", {post: post});
  //     }
  //   });
});

app.post("/compose", function (req, res) {
  const title = req.body.postTitle;
  const body = req.body.postText;
  const id = req.body.applyID;

  const newPost = new Post({
    title: title,
    body: body,
  });

  //If the id of the post doesnt exits, it creates a new document, if it does then it will find the document with the id of the post and update it
  if (!id) {
    //The redirect method should be executed only once the post has been saved with no erors, otherwise there might be a bug where the post doesnt show up in the home page.
    newPost
      .save()
      .then((result) => {
        console.log(
          "New post has been successfully added to database: " + result
        );
        res.redirect("/");
      })
      .catch((err) => {
        console.log("Unable to add new post to database: " + err + foundPost);
      });
  } else {
    Post.findOneAndUpdate({ _id: id }, { title: title, body: body })
      .then((result) => {
        console.log(
          "Post has been successfully updated in database: " + result
        );
        res.redirect("/posts/" + id);
      })
      .catch((err) => {
        console.log("Unable to update post in database: " + err);
      });
  }
});

app.post("/delete", function (req, res) {
  const postID = req.body.deleteID;

  Post.findByIdAndRemove(postID)
    .then((result) => {
      console.log(
        "Successfully deleted the post from database: " + result.title
      );
      res.redirect("/");
    })
    .catch((err) => {
      console.log("An error ocurred removing the post from database: " + err);
    });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
